import ConnectToDatabase from "./Connexion"
import { AppError } from "../services/Authentication"


type ActiveOrderRaw = {
    id:string
    total: string | number
}

type LocalPayment = {
    id:string
    mercado_pago_id:string | null
    status:string
}

type ExpiredPaymentCandidate = {
    id:string
    client_id:string
    mercado_pago_id:string
    expires_at:Date | string
}

type OrderToFinalize = {
    id: string
    productid: string
    provider: string
    quantity: number
    state: string
}

type TerminalPaymentStatus = 'EXPIRED' | 'CANCELLED'


export default class PaymentData extends ConnectToDatabase {
    protected ORDER_TABLE = "orders"
    protected PAYMENTS_TABLE = "payments"
    protected PAYMENT_ORDERS_TABLE = "payment_orders" 
    protected PRODUCT_TABLE = "products"



    public hasPendingPaymentForClient = async(clientid:string):Promise<boolean>=>{
        const pendingPayment = await ConnectToDatabase.con(this.PAYMENTS_TABLE)
            .select('id')
            .where({
                client_id: clientid,
                status: 'PENDING'
            })
            .first()

        return Boolean(pendingPayment)
    }

    public createPendingPayment = async(
        clientId:string,
        paymentId:string,
        method:string
    ):Promise<{ amount: number, orderIds: string[] }>=>{
        const createdAt = new Date()
        const expiresAt = new Date(createdAt.getTime() + 30 * 60 * 1000)

        return ConnectToDatabase.con.transaction(async (trx)=>{
            const orders: ActiveOrderRaw[] = await trx(this.ORDER_TABLE)
                .select('id', 'total')
                .where({
                    client: clientId,
                    state: 'REQUESTED'
                })
                .forUpdate()

            if(orders.length === 0){
                throw new AppError(400, "You do not have any active orders to pay for")
            }

            const orderIds = orders.map((order) => order.id)
            const existingPendingPayment = await trx({
                paymentOrder: this.PAYMENT_ORDERS_TABLE
            })
                .join(
                    { payment: this.PAYMENTS_TABLE },
                    'payment.id',
                    'paymentOrder.payment_id'
                )
                .whereIn('paymentOrder.order_id', orderIds)
                .andWhere(function(){
                    this.where('payment.status', 'PENDING')
                        .orWhere('payment.status', 'APPROVED')
                })
                .andWhere('payment.client_id', clientId)
                .first('payment.id')

            if(existingPendingPayment){
                throw new AppError(409, "These orders already have a pending payment")
            }

            const amountInCents = orders.reduce((sum, order)=>{
                const orderTotal = Number(order.total)

                if(!Number.isFinite(orderTotal) || orderTotal<= 0){
                    throw new AppError(400, "An order has an invalid total")
                }

                return sum + Math.round(orderTotal * 100)
            }, 0)

            if(amountInCents <= 0){
                throw new AppError(400, "Invalid total order amount")
            }

            await trx(this.PAYMENTS_TABLE).insert({
                id: paymentId,
                client_id: clientId,
                external_reference: paymentId,
                amount: (amountInCents / 100).toFixed(2),
                method,
                status: "PENDING",
                created_at: createdAt,
                expires_at: expiresAt
            })

            await trx(this.PAYMENT_ORDERS_TABLE).insert(
                orderIds.map((orderId) =>({
                    payment_id: paymentId,
                    order_id: orderId
                }))
            )

            return {
                amount: amountInCents / 100,
                orderIds
            }
        })
    }

    public saveGatewayResult = async(
        internalPaymentId:string,
        mercadoPagoId:string,
        gatewayStatus:string
    ):Promise<void>=>{
        if(!internalPaymentId || !mercadoPagoId || !gatewayStatus){
            throw new AppError(400, "Payment result fields are required")
        }

        const normalizedStatus = gatewayStatus.toLowerCase()
        
        const status = normalizedStatus === 'approved'
            ? 'APPROVED'
            : 'PENDING'

        const terminalStatuses = ['EXPIRED', 'CANCELLED']
        
        const updatedRows = await ConnectToDatabase.con(this.PAYMENTS_TABLE)
            .where({ id: internalPaymentId })
            .whereNotIn('status', terminalStatuses)
            .update({
                mercado_pago_id: mercadoPagoId,
                status
            })
            .returning('id')
        
        if(updatedRows.length !== 1){
            const payment = await ConnectToDatabase.con(this.PAYMENTS_TABLE)
                .select('status')
                .where({ id: internalPaymentId })
                .first()
            
            if(terminalStatuses.includes(payment?.status ?? '')) return
            
            throw new AppError(404, "Local payment record not found")
        }
    }

    public markPaymentRejected = async(internalPaymentId:string):Promise<void>=>{
        const updatedRows = await ConnectToDatabase.con(this.PAYMENTS_TABLE)
            .where({
                id: internalPaymentId,
                status: 'PENDING'
            })
            .update({ status: 'REJECTED' })
            .returning('id')
        
        if(updatedRows.length !== 1){
            throw new AppError(500, "Could not mark the payment as rejected")
        }
    }

    public findPaymentForClient = async(
        internalPaymentId:string,
        clientId:string
    ):Promise<LocalPayment | undefined>=>{
        const [payment]: LocalPayment[] = await ConnectToDatabase.con(this.PAYMENTS_TABLE)
            .select('id', 'mercado_pago_id', 'status')
            .where({
                id: internalPaymentId,
                client_id: clientId
            })

        return payment
    }

    public findPaymentOrderStates = async(
        internalPaymentId:string
    ):Promise<string[]>=>{
        const orders:Array<{ state:string }> = await ConnectToDatabase.con(this.ORDER_TABLE)
            .join(
                this.PAYMENT_ORDERS_TABLE,
                `${this.PAYMENT_ORDERS_TABLE}.order_id`,
                `${this.ORDER_TABLE}.id`
            )
            .select(`${this.ORDER_TABLE}.state`)
            .where(
                `${this.PAYMENT_ORDERS_TABLE}.payment_id`,
                internalPaymentId
            )
        
        return orders.map((order) => order.state)
    }

    public findExpiredPendingPayments = async():Promise<ExpiredPaymentCandidate[]>=>{
        try{
            return await ConnectToDatabase.con(this.PAYMENTS_TABLE)
                .select('id', 'client_id', 'mercado_pago_id', 'expires_at')
                .where('status', 'PENDING')
                .andWhere('expires_at', '<=', new Date())
                .whereNotNull('mercado_pago_id')
                .orderBy('expires_at', 'asc')
                .limit(10)
        }catch(error:any){
            throw new Error(`Error finding expired payments: ${error.message || error}`)
        }
    }    

    private finalizePendingPaymentAndRestoreStock = async(
        internalPaymentId:string,
        terminalStatus:TerminalPaymentStatus,
        requireExpiration:boolean
    ):Promise<boolean>=>{
        const now = new Date()

        return ConnectToDatabase.con.transaction(async(trx)=>{
            const paymentQuery = trx(this.PAYMENTS_TABLE)
                .select('id', 'mercado_pago_id')
                .where({
                    id:internalPaymentId,
                    status:'PENDING'
                })

            if(requireExpiration){
                paymentQuery.andWhere('expires_at', '<=', now)
            }

            const [payment] = await paymentQuery.forUpdate()

            if(!payment || !payment.mercado_pago_id) return false

            const orders: OrderToFinalize[] = await trx(this.ORDER_TABLE)
                .join(
                    this.PAYMENT_ORDERS_TABLE,
                    `${this.PAYMENT_ORDERS_TABLE}.order_id`,
                    `${this.ORDER_TABLE}.id`
                )
                .select(
                    `${this.ORDER_TABLE}.id`,
                    `${this.ORDER_TABLE}.productid`,
                    `${this.ORDER_TABLE}.provider`,
                    `${this.ORDER_TABLE}.quantity`,
                    `${this.ORDER_TABLE}.state`
                )
                .where(`${this.PAYMENT_ORDERS_TABLE}.payment_id`, internalPaymentId)
                .forUpdate()
            
            if(orders.length === 0){
                throw new AppError(409, "Payment has no associated orders")
            }

            if(
                terminalStatus === 'CANCELLED' &&
                orders.some((order) => order.state !== 'REQUESTED')
            ){
                throw new AppError(
                    409,
                    "All associated orders must still be requested to cancel payment"
                )
            }

            const paymentUpdateQuery = trx(this.PAYMENTS_TABLE)
                .where({
                    id: internalPaymentId,
                    status: 'PENDING'
                })

            if(requireExpiration){
                paymentUpdateQuery.andWhere('expires_at', '<=', now)
            }

            const updatedPayments = await paymentUpdateQuery
                .update({ status: terminalStatus })
                .returning('id')
            
            if(updatedPayments.length !== 1) return false

            for(const order of orders){
                if(order.state !== 'REQUESTED') continue

                const expireOrders = await trx(this.ORDER_TABLE)
                    .where({
                        id: order.id,
                        state: 'REQUESTED'
                    })
                    .update({ state: 'EXPIRED' })
                    .returning('id')
                
                if(expireOrders.length !== 1){
                    if(terminalStatus === 'CANCELLED'){
                        throw new AppError(
                            409,
                            "An associated order changed while cancelling payment"
                        )
                    }
                    continue
                }

                const restoredProducts = await trx(this.PRODUCT_TABLE)
                    .where({
                        id: order.productid,
                        provider: order.provider
                    })
                    .increment('stock', order.quantity)
                    .returning('id')

                if(restoredProducts.length !== 1){
                    throw new Error(`Could not restore stock for order ${order.id}`)
                }
            }

            return true
        })
    }

    public expirePaymentAndRestoreStock = async(
        internalPaymentId:string
    ):Promise<boolean>=>{
        return this.finalizePendingPaymentAndRestoreStock(
            internalPaymentId,
            'EXPIRED',
            true
        )
    }

    public cancelPendingPaymentRestoreStock = async(
        internalPaymentId:string
    ):Promise<boolean>=>{
        return this.finalizePendingPaymentAndRestoreStock(
            internalPaymentId,
            'CANCELLED',
            false
        )
    }
}
