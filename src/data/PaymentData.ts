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
    merdado_pago_id:string | null
    expires_at:Date | string
}


export default class PaymentData extends ConnectToDatabase {
    protected ORDER_TABLE = "orders"
    protected PAYMENTS_TABLE = "payments"
    protected PAYMENT_ORDERS_TABLE = "payment_orders" 

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
        const pendingStatuses = [
            "pending",
            "in_process",
            "authorized",
            "in_mediation"
        ]
        const rejectedStatuses = [
            "rejected",
            "cancelled",
            "refunded",
            "charged_back"
        ]

        const status = normalizedStatus === 'approved'
            ? 'APPROVED'
            : rejectedStatuses.includes(normalizedStatus)
                ? 'REJECTED'
                : pendingStatuses.includes(normalizedStatus)
                    ? 'PENDING'
                    : 'PENDING'
        
        const updatedRows = await ConnectToDatabase.con(this.PAYMENTS_TABLE)
            .where({ id: internalPaymentId })
            .update({
                mercado_pago_id: mercadoPagoId,
                status
            })
            .returning('id')
        
        if(updatedRows.length !== 1){
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

    public findExpiredPendingPayments = async():Promise<ExpiredPaymentCandidate[]>=>{
        try{
            return await ConnectToDatabase.con(this.PAYMENTS_TABLE)
                .select('id', 'client_id', 'mercado_pago_id', 'expires_at')
                .where('status', 'PENDING')
                .andWhere('expires_at', '<=', new Date())
                .whereNotNull('mercado_pago_id')
        }catch(error:any){
            throw new Error(`Error finding expired payments: ${error.message || error}`)
        }
    }
}
