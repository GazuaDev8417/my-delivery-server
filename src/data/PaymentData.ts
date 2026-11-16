import ConnectToDatabase from "./Connexion"
import { AppError } from "../services/Authentication"


type ActiveOrderRaw = {
    id:string
    total: string | number
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
                .andWhere('payment.status', 'PENDING')
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
}
