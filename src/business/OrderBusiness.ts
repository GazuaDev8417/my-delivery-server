import Order from "../model/Order"
import OrderData from "../data/OrderData"
import Services, { AppError } from "../services/Authentication"
import moment from "moment-timezone"
import { OrderModel, UserModel, RestaurantModel } from "../model/typesAndInterfaces"
import axios from "axios"
import { config } from "dotenv"
import { v4 as uuidv4 } from "uuid"


config()



export interface CreateOrderDTO{
    product: string
    price: number
    quantity: number
    momentString: string
    photoUrl: string
    description: string

}

export interface PaymentDTO {
    paymentMethodId: string
    email: string
    items: Array<{ unit_price: number, quantity: number }>
}



export default class OrderBusiness{
    constructor(
        private orderData:OrderData,
        private services:Services
    ){}

    public createOrder = async(user:UserModel, orderDataDTO:CreateOrderDTO):Promise<void>=>{
        const { product, price, quantity, momentString, photoUrl, description } = orderDataDTO

        if (!product || !price || !quantity) {
            throw new AppError(400, "Missing required order fields");
        }
        
        const address = `${user.street} ${user.number}, ${user.neighbourhood} ${user.city} - ${user.state}`
        const localMoment = moment.utc(momentString).tz("America/Sao_Paulo").format('DD/MM/YYYY [at] HH:mm')
        const id = this.services.idGenerator()

        const existingOrder = await this.orderData.findRequestedOrder(product, price, description, user.id)
        if(existingOrder){
            throw new AppError(403, `You already have an active order for '${product}'. Would you like to view it?`)
        }

        const order = new Order(
            id, 
            product, 
            price, 
            photoUrl, 
            quantity,
            quantity * price,
            localMoment,
            user.id,
            'REQUESTED',
            address,
            description
        )

        await this.orderData.createOrder(order)
    }
    

    public getOrderById = async(user:UserModel, orderId:string):Promise<OrderModel>=>{
        const order = await this.orderData.findOrderById(orderId)
        if(!order){
            throw new AppError(404, 'Order not found')
        }
       
        return order
    }

   
    public deleteOrder = async (orderId: string): Promise<void> => {
        await this.orderData.deleteOrder(orderId);
    }


    public clearOrderHistory = async (userId: string): Promise<void> => {
        const finishedOrders = await this.orderData.findFinishedOrdersByClient(userId);
        if (finishedOrders.length === 0) {
            throw new AppError(404, "Your order history is already empty");
        }
        await this.orderData.deleteFinishedOrdersByClient(userId);
    }


    public clearRequestedOrders = async (userId: string, orderId: string): Promise<void> => {
        await this.orderData.deleteRequestedOrdersByProvider(userId, orderId);
    }


    public updateOrderQuantity = async (orderId: string, quantity: number): Promise<void> => {
        if (!quantity || quantity <= 0) {
            throw new AppError(400, "Please provide a valid quantity");
        }

        await this.orderData.updateOrderQuantity(quantity, orderId);
    }


    public finishAllOrdersByClient = async(userId:string):Promise<void>=>{
        const activeOrders = await this.orderData.findActiveOrdersByClient(userId)
        if(activeOrders.length === 0){
            throw new AppError(400, 'All orders have already been finished or none exist')
        }
        await this.orderData.finishAllOrdersByClient(userId)
    }


    public markOrderAsFinished = async(orderId:string):Promise<void>=>{
        const order = await this.orderData.findOrderById(orderId)
        if(!order){
            throw new AppError(404, 'Order not found')
        }
        await this.orderData.updateOrderStatusToFinished(orderId)
    }


    public revertOrderToRequested = async(orderId:string):Promise<void>=>{
        const order = await this.orderData.findOrderById(orderId)
        if(!order){
            throw new AppError(404, 'Order not found')
        }
        await this.orderData.updateOrderStatusToRequested(orderId)
    }


    /* private removeExpiredOrders = async(orders:OrderModel[]):Promise<void>=>{
        const startOfToday = moment().tz('America/Sao_Paulo').startOf('day')

        for(const order of orders){
            const orderDate = moment.tz(
                order.moment,
                'DD/MM/YYYY [at] HH:mm',
                'America/Sao_Paulo'
            ).startOf('day')

            if(orderDate.isBefore(startOfToday)){
                await this.orderData.deleteOrder(order.id)
            }
        }
    } */

    
    public getActiveOrders = async(userId:string):Promise<OrderModel[]>=>{
        const orders = await this.orderData.findActiveOrdersByClient(userId)
        if(orders.length === 0){
            throw new AppError(404, "You haven't placed any active orders yet")
        }
        //await this.removeExpiredOrders(orders)
        return orders
    }


    public getAllOrders = async():Promise<OrderModel[]>=>{
        const orders = await this.orderData.findAllOrders()
        //await this.removeExpiredOrders(orders)
        
        if(orders.length === 0){
            throw new AppError(404, 'Order list is empty')
        } 

        return orders
    }


    public getActiveOrdersByUserId = async(userId:string):Promise<OrderModel[]>=>{
        const orders = await this.orderData.findAllOrdersByClient(userId)
        if(orders.length === 0){
            throw new AppError(404, 'No active orders found for this user')
        }
        return orders
    }


    public getFinishedOrders = async(userId:string):Promise<OrderModel[]>=>{
        const orders = await this.orderData.findFinishedOrdersByClient(userId)
        if(orders.length === 0){
            throw new AppError(404, 'No finished orders found in your history')
        }
        //await this.removeExpiredOrders(orders)
        return orders
    } 
    
    
    public processPayment = async(paymentDTO:PaymentDTO):Promise<any>=>{
        try{
            const { paymentMethodId, email, items } = paymentDTO
            const orderId = `${email}-${Date.now()}`
            const totalAmount = items.reduce(
                (acc: number, item: any) => acc + (item.unit_price * item.quantity),
                0
            )
            
            const payload:any = {
                transaction_amount: Number(totalAmount.toFixed(2)),
                description: 'In-app Purchase',
                payment_method_id: paymentMethodId,
                payer: {
                    email: email,
                    first_name: 'Customer',
                    last_name: 'Test',
                    identification: {
                        type: 'CPF',
                        number: '19119119100'
                    }
                },
                external_reference: orderId
            }


            if(['visa', 'master', 'amex'].includes(paymentMethodId)){
                payload.installments = 1
            }

            const response = await axios.post(
                'https://api.mercadopago.com/v1/payments',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ACCESS_TOKEN?.trim()}`,
                        'X-Idempotency-Key': uuidv4()
                    }
                }
            )

            return response.data
        }catch(e:any){
            if(axios.isAxiosError(e)){
                throw new AppError(
                    e.response?.status || 500,
                    e.response?.data?.message || 'Payment processing failed'
                )
            }

            throw new AppError(500, e.message || 'Internal server error while processing payment')
        }     
    }
    
    
    public getPaymentStatus = async(paymentId:string):Promise<string>=>{
        try{
            
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
            })

            return response.data.status                      
        }catch(e:any){
            if(axios.isAxiosError(e)){
                throw new AppError(
                    e.response?.status || 500,
                    'Unable to retrieve payment status'
                )
            }
            throw new AppError(500, e.message || 'Failed to fetch payment status')
        }
    }
}