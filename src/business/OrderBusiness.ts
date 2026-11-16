import Order from "../model/Order"
import OrderData from "../data/OrderData"
import Services, { AppError } from "../services/Authentication"
//import moment from "moment-timezone"
import { OrderModel, UserModel, OrdersByMonthModel } from "../model/typesAndInterfaces"
import axios from "axios"
import { config } from "dotenv"
import { randomUUID as uuidv4 } from "crypto"
import { AuthenticatedActor } from '../services/Authentication'



config()



export interface CreateOrderDTO{
    product: string
    price: number
    quantity: number
    momentString: string
    photoUrl: string
    description: string
    providerId: string
    productId: string

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
        const { quantity, providerId, productId } = orderDataDTO

        if (!providerId || !productId || !quantity) {
            throw new AppError(400, "Missing required order fields");
        }

        if(!Number.isInteger(quantity) || quantity <= 0){
            throw new AppError(400, 'Quantity must be a positive integer')
        }

        const dbProduct = await this.orderData.findProductByIdAndProvider(productId, providerId)
        if(!dbProduct){
            throw new AppError(404, "Product not found for this provider")
        }

        const realPrice = Number(dbProduct.price)
        const realProductName = dbProduct.name || dbProduct.product || orderDataDTO.product
        const realDescription = dbProduct.description || orderDataDTO.description || ''
        const realPhotoUrl = dbProduct.photoUrl || dbProduct.photo_url || orderDataDTO.photoUrl || ''
        const address = `${user.street} ${user.number}, ${user.neighbourhood} ${user.city} - ${user.state}`
        const id = this.services.idGenerator()

        const existingOrder = await this.orderData.findRequestedOrder(realProductName, realPrice, realDescription, user.id)
        if(existingOrder){
            throw new AppError(403, `You already have an active order for '${realProductName}'. Would you like to view it?`)
        }

        const order = new Order(
            id, 
            realProductName, 
            realPrice, 
            realPhotoUrl, 
            quantity,
            Number((quantity * realPrice).toFixed(2)),
            new Date(),
            user.id,
            'REQUESTED',
            address,
            realDescription,
            providerId,
            productId
        )

        await this.orderData.createOrder(order, productId, providerId, quantity)
    }


    private verifyOrderAccess(order: OrderModel, actor: AuthenticatedActor): void {
        const isOwnerUser = actor.role === 'USER' && order.client === actor.id;
        const isOwnerRestaurant = actor.role === 'RESTAURANT' && order.provider === actor.id;

        if (!isOwnerUser && !isOwnerRestaurant) {
            throw new AppError(403, 'You do not have permission to access or modify this order');
        }
    }
    

    public getOrderById = async(orderId:string, actor: AuthenticatedActor):Promise<OrderModel>=>{
        const order = await this.orderData.findOrderById(orderId)
        if(!order){
            throw new AppError(404, 'Order not found')
        }

        this.verifyOrderAccess(order, actor)
       
        return order
    }

   
    public deleteOrder = async (orderId: string, actor: AuthenticatedActor): Promise<void> => {
        const order = await this.orderData.findOrderById(orderId)
        if(!order){
            throw new AppError(404, 'Order not found')
        }

        this.verifyOrderAccess(order, actor)

        if(actor.role === 'RESTAURANT' && order.state === 'REQUESTED'){
            throw new AppError(403, 'Providers cannot delete pending orders')
        }

        await this.orderData.deleteOrder(order);
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


    public updateOrderQuantity = async (orderId: string, quantity: number, userId: string): Promise<void> => {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new AppError(400, "Please provide a valid quantity");
        }

        const order = await this.orderData.findOrderById(orderId)
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        if(order.client !== userId){
            throw new AppError(403, 'You do not have permission to update this order')
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


    public markOrderAsFinished = async(
        orderId:string,
        providerId:string
    ):Promise<void>=>{
        const order = await this.orderData.findOrderById(orderId)
       
        if(!order){
            throw new AppError(404, 'Order not found')
        }

        if(order.provider !== providerId){
            throw new AppError(403, 'You do not have permission to update this order')
        }

        await this.orderData.updateOrderStatusToFinished(orderId, providerId)
    }


    public revertOrderToRequested = async(
        orderId:string, 
        providerId:string
    ):Promise<void>=>{
        
        const order = await this.orderData.findOrderById(orderId)
        if(!order){
            throw new AppError(404, 'Order not found')
        }

        if(order.provider !== providerId){
            throw new AppError(403, 'You do not have permission to update this order')
        }
        
        await this.orderData.updateOrderStatusToRequested(orderId, providerId)
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


    public getAllOrders = async(providerId:string):Promise<OrderModel[]>=>{
        const orders = await this.orderData.findAllOrders(providerId)
        //await this.removeExpiredOrders(orders)
        
        if(orders.length === 0){
            throw new AppError(404, 'Order list is empty')
        } 

        return orders
    }


    public getRecentOrders = async(providerId:string):Promise<OrderModel[]>=>{
        const recentOrders = await this.orderData.findRecentOrders(providerId)
        //await this.removeExpiredOrders(orders)
        
        if(recentOrders.length === 0){
            throw new AppError(404, 'Order list is empty')
        } 

        return recentOrders
    }


    public ordersByMonth = async(providerId:string):Promise<OrdersByMonthModel[]>=>{
        const findOrdersByMonth = await this.orderData.findOrdersByMonth(providerId)
        //await this.removeExpiredOrders(orders)
        
        if(findOrdersByMonth.length === 0){
            throw new AppError(404, 'Order list is empty')
        } 

        return findOrdersByMonth
    }


    public getActiveOrdersByUserId = async(userId:string, providerId:string):Promise<OrderModel[]>=>{
        const orders = await this.orderData.findAllOrdersByClient(userId, providerId)
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
    
    
    public processPayment = async(paymentDTO:PaymentDTO, user:UserModel):Promise<any>=>{
        try{
            const { paymentMethodId } = paymentDTO

            if(!paymentMethodId){
                throw new AppError(400, "Payment method is required")
            }

            const activeOrders = await this.orderData.findActiveOrdersByClient(user.id)
            if(!activeOrders || activeOrders.length === 0){
                throw new AppError(400, "You do not have any active orders to pay for")
            }

            const totalAmount = activeOrders.reduce(
                (acc: number, order: any) => acc + Number(order.total || (order.price * order.quantity)),
                0
            )

            if(totalAmount <= 0){
                throw new AppError(400, "Invalid total order amount")
            }
            
            const orderId = `${user.email}-${Date.now()}`
            
            const payload:any = {
                transaction_amount: Number(totalAmount.toFixed(2)),
                description: 'In-app Purchase',
                payment_method_id: paymentMethodId,
                payer: {
                    email: user.email,
                    first_name: user.username || 'Customer',
                    last_name: 'Client',
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
            if(e instanceof AppError){
                throw e
            }

            if(axios.isAxiosError(e)){
                throw new AppError(
                    e.response?.status || 500,
                    e.response?.data?.message || 'Payment processing failed'
                )
            }

            throw new AppError(500, e.message || 'Internal server error while processing payment')
        }     
    }
    
    
    public getPaymentStatus = async(paymentId:string, user:UserModel):Promise<string>=>{
        try{
            
            if(!paymentId){
                throw new AppError(400, "Payment ID is required")
            }

            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN?.trim()}` }
            })

            const externalRef: string = response.data.external_reference || ''
            const payerEmail: string  = response.data.payer?.email || ''

            const isOwner = externalRef.startsWith(`${user.email}`) || payerEmail === user.email

            if(!isOwner){
                throw new AppError(403, "You do not have permission to view this payment status")
            }

            return response.data.status                      
        }catch(e:any){
            if(e instanceof AppError){
                throw e
            }

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