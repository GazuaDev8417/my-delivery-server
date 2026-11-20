import Order from "../model/Order"
import OrderData from "../data/OrderData"
import Services, { AppError } from "../services/Authentication"
//import moment from "moment-timezone"
import { OrderModel, UserModel, OrdersByMonthModel } from "../model/typesAndInterfaces"
import axios from "axios"
import { config } from "dotenv"
import { randomUUID as uuidv4 } from "crypto"
import PaymentData from "../data/PaymentData"
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
    token?: string
    issuerId?: string
    payerEmail?: string
    installments?: number
    payerIdentification?: {
        type: string
        number: string
    }
}

export interface PendingPaymentResponse {
    orderId: string
    status: string
    createdAt: string
    qrCode: string | null
    qrCodeBase64: string | null
    qrCodeLink: string | null
}



export default class OrderBusiness{
    constructor(
        private orderData:OrderData,
        private services:Services,
        private paymentData: PaymentData
    ){}

    public createOrder = async(user:UserModel, orderDataDTO:CreateOrderDTO):Promise<void>=>{
        const { quantity, providerId, productId } = orderDataDTO

        if (!providerId || !productId || !quantity) {
            throw new AppError(400, "Missing required order fields");
        }

        if(!Number.isInteger(quantity) || quantity <= 0){
            throw new AppError(400, 'Quantity must be a positive integer')
        }

        if(await this.paymentData.hasPendingPaymentForClient(user.id)){
            throw new AppError(
                409,
                'You already have a pending payment. Please complete or cancel this payment before placing another order.'
            )
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

        if(actor.role === 'RESTAURANT' && order.state === 'EXPIRED'){
            await this.orderData.archiveExpireOrder(order.id, actor.id)
            return
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

        if(order.state !== 'REQUESTED'){
            throw new AppError(409, 'Only requested orders can be marked as finished.')
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

        if(order.state !== 'FINISHED'){
            throw new AppError(409, 'Only finished orders can be returned to pending.')
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


    public getPaidOrders = async(userId:string):Promise<OrderModel[]>=>{
        const orders = await this.orderData.findPaidOrdersByClient(userId)

        if(orders.length === 0){
            throw new AppError(404, 'No paid orders found')
        }

        return orders
    }


    public getAllOrders = async(providerId:string):Promise<OrderModel[]>=>{
        const orders = await this.orderData.findVisibleOrdersByProvider(providerId)
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
        let internalPaymentId:string | undefined
        let localPaymentCreated = false

        try{
            const paymentMethodId = paymentDTO.paymentMethodId?.trim()

            if(!paymentMethodId){
                throw new AppError(400, "Payment method is required")
            }

            const isPix = paymentMethodId === 'pix'
            let cardData: {
                token: string
                issuerId: string
                installments: number
                payerEmail: string
                payerIdentification: { type: string, number: string }
            } | undefined

            if(!isPix){
                const token = paymentDTO.token?.trim()
                const issuerId = paymentDTO.issuerId?.trim()
                const installments = paymentDTO.installments
                const payerEmail = paymentDTO.payerEmail?.trim()
                const identificationType = paymentDTO.payerIdentification?.type?.trim()
                const identificationNumber = paymentDTO.payerIdentification?.number?.trim()

                if(
                    !token ||
                    !issuerId ||
                    typeof installments !== 'number' ||
                    !Number.isInteger(installments) ||
                    installments < 1 ||
                    !payerEmail ||
                    !identificationType ||
                    !identificationNumber 
                ){
                    throw new AppError(400, "Card payment data is incomplete")
                }

                cardData = {
                    token,
                    issuerId,
                    installments,
                    payerEmail,
                    payerIdentification: {
                        type: identificationType,
                        number: identificationNumber
                    }
                }
            }

            

            const accessToken = process.env.ACCESS_TOKEN?.trim()

            if(!accessToken){
                throw new AppError(500, "Payment service is not configured")
            }

            internalPaymentId = uuidv4()

            const { amount } = await this.paymentData.createPendingPayment(
                user.id,
                internalPaymentId,
                paymentMethodId
            )
            localPaymentCreated = true

            const payload = isPix
                ? {
                transaction_amount: amount,
                description: 'My Delivery order',
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
                external_reference: internalPaymentId
            } : {
                    transaction_amount: amount,
                    description: 'My Delivery order',
                    token: cardData?.token,
                    installments: cardData?.installments,
                    payment_method_id: paymentMethodId,
                    issuer_id: cardData?.issuerId,
                    payer: {
                        email: cardData?.payerEmail,
                        first_name: user.username || 'Customer',
                        last_name: 'Client',
                        identification: cardData?.payerIdentification
                    },
                    external_reference: internalPaymentId
                }

            const response = await axios.post(
                'https://api.mercadopago.com/v1/payments',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "X-Idempotency-Key": internalPaymentId
                    }
                }
            )

            if(!response.data?.id || !response.data?.status){
                throw new AppError(502, "Payment provider returned an incomplete response")
            }

            await this.paymentData.saveGatewayResult(
                internalPaymentId,
                String(response.data.id),
                String(response.data.status)
            )

            return response.data
        }catch(error:unknown){
            if(error instanceof AppError){
                throw error
            }

            if(axios.isAxiosError(error)){
                const responseStatus = error.response?.status

                if(
                    localPaymentCreated &&
                    internalPaymentId &&
                    responseStatus !== undefined &&
                    responseStatus >= 400 &&
                    responseStatus < 500
                ){
                    await this.paymentData.markPaymentRejected(internalPaymentId)  
                }

                throw new AppError(
                    responseStatus || 502,
                    error.response?.data?.message || 'Payment processing failed'
                )
            }

            throw new AppError(
                    500,
                    error instanceof Error
                        ? error.message
                        : 'Unexpected payment error'
                )
        }    
    }


    public getPaymentStatus = async(
        internalPaymentId:string,
        user:UserModel
    ):Promise<string>=>{
        try{
            if(!internalPaymentId){
                throw new AppError(400, "Payment ID is required")
            }

            const payment = await this.paymentData.findPaymentForClient(
                internalPaymentId,
                user.id
            )

            if(!payment){
                throw new AppError(404, "Payment not found")
            }

            if(!payment.mercado_pago_id){
                throw new AppError(409, "Payment is still being registered")
            }

            const accessToken = process.env.ACCESS_TOKEN?.trim()

            if(!accessToken){
                throw new AppError(500, "Payment service is not configured")
            }

            const response = await axios.get(
                `https://api.mercadopago.com/v1/payments/${payment.mercado_pago_id}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}`}
                }
            )

            if(
                String(response.data.id) !== payment.mercado_pago_id ||
                response.data.external_reference !== payment.id
            ){
                throw new AppError(403, "Payment does not match this order")
            }

            const status = String(response.data.status)

            await this.paymentData.saveGatewayResult(
                payment.id,
                payment.mercado_pago_id,
                status
            )

            return status
        }catch(error){
            if(error instanceof AppError){
                throw error
            }

            if(axios.isAxiosError(error)){
                throw new AppError(
                    error.response?.status || 502,
                    error.response?.data?.message || 'Unable to retrieve payment status'
                )
            }

            throw new AppError(
                500,
                error instanceof Error ? error.message : 'Unexpected payment status error'
            )
        }
    }


    public getPendingPayment = async(user:UserModel):Promise<PendingPaymentResponse>=>{
        try{
            const payment = await this.paymentData.findPendingPaymentForClient(user.id)

            if(!payment){
                throw new AppError(404, "No pending payment found")
            }

            if(!payment.mercado_pago_id){
                throw new AppError(409, "Payment is still being registered")
            }

            const accessToken = process.env.ACCESS_TOKEN?.trim()

            if(!accessToken){
                throw new AppError(500, "Payment service is not configured")
            }

            const response = await axios.get(
                `https://api.mercadopago.com/v1/payments/${payment.mercado_pago_id}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    timeout: 5000
                }
            )

            if(
                String(response.data?.id) !== payment.mercado_pago_id ||
                response.data?.external_reference !== payment.id
            ){
                throw new AppError(502, "Payment provider returned a mismatched payment")
            }

            const status = String(response.data?.status || '').toLowerCase()

            if(!status){
                throw new AppError(502, "Payment provider returned an empty status")
            }

            await this.paymentData.saveGatewayResult(
                payment.id,
                payment.mercado_pago_id,
                status
            )

            const transactionData = 
                response.data?.point_of_interaciont?.transaction_data
            
            return {
                orderId: payment.id,
                status,
                createdAt: new Date(payment.created_at).toISOString(),
                qrCode: transactionData?.qr_code || null,
                qrCodeBase64: transactionData?.qr_code_base64 || null,
                qrCodeLink:
                    transactionData?.ticket_url ||
                    transactionData?.qr_code_link ||
                    null
            }
        }catch(error:unknown){
            if(error instanceof AppError){
                throw error
            }

            if(axios.isAxiosError(error)){
                throw new AppError(
                    error.response?.status || 502,
                    error.response?.data?.message || 'Unable to retrieve pending payment'
                )
            }

            throw new AppError(
                500,
                error instanceof Error
                    ? error.message
                    : 'Unexpected pending payment error'
            )
        }
    }


    public cancelPayment = async(
        internalPaymentId: string,
        user: UserModel
    ):Promise<void>=>{
        try{
            const paymentId = internalPaymentId?.trim()

            if(!paymentId){
                throw new AppError(400, "Payment ID is required")
            }

            const payment = await this.paymentData.findPaymentForClient(
                paymentId,
                user.id
            )

            if(!payment){
                throw new AppError(404, "Payment not found")
            }

            if(payment.status !== 'PENDING'){
                throw new AppError(409, "Only pending payments can be cancelled")
            }

            const mercadoPagoId = payment.mercado_pago_id

            if(!mercadoPagoId){
                throw new AppError(409, "Payment is still being registered")
            }

            const orderStatus = await this.paymentData.findPaymentOrderStates(payment.id)

            if(
                orderStatus.length === 0 ||
                orderStatus.some((state) => state !== 'REQUESTED')
            ){
                throw new AppError(
                    409,
                    "Payment cannot be cancelled because an associated order is no longer pending"
                )  
            }

            const accessToken = process.env.ACCESS_TOKEN?.trim()

            if(!accessToken){
                throw new AppError(500, "Payment service is not configured")
            }

            const paymentUrl = `https://api.mercadopago.com/v1/payments/${mercadoPagoId}`
            const requestConfig = {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 5000
            }

            const paymentResponse = await axios.get(paymentUrl, requestConfig)

            if(
                String(paymentResponse.data?.id) !== mercadoPagoId ||
                paymentResponse.data?.external_reference !== payment.id
            ){
                throw new AppError(502, "Payment provider returned a mismatched payment")
            }

            let gatewayStatus = String(paymentResponse.data?.status || '').toLowerCase()

            if(gatewayStatus === 'approved'){
                await this.paymentData.saveGatewayResult(
                    payment.id,
                    mercadoPagoId,
                    gatewayStatus
                )
                throw new AppError(409, "An approved payment cannot be cancelled")
            }

            if(gatewayStatus === 'pending'){
                const cancellationResponse = await axios.put(
                    paymentUrl,
                    { status: 'cancelled' },
                    requestConfig
                )

                if(
                    String(cancellationResponse.data?.id) !== mercadoPagoId ||
                    cancellationResponse.data?.external_reference !== payment.id
                ){
                    throw new AppError(502, "Payment provider returned a mismatched cancellation")
                }

                gatewayStatus = String(cancellationResponse.data?.status || '').toLocaleLowerCase()
            }

            if(gatewayStatus === 'approved'){
                await this.paymentData.saveGatewayResult(
                    payment.id,
                    mercadoPagoId,
                    gatewayStatus
                )
                throw new AppError(409, "An approved payment cannot be cancelled")
            }

            if(gatewayStatus !== 'cancelled' && gatewayStatus !== 'rejected'){
                throw new AppError(409, "Payment provider did not confirm cancellation")
            }

            const finalized = await this.paymentData.cancelPendingPaymentRestoreStock(payment.id)

            if(!finalized){
                throw new AppError(409, "Payment could not be finalized as cancelled")
            }

        }catch(error:unknown){
            if(error instanceof AppError){
                throw error
            }

            if(axios.isAxiosError(error)){
                throw new AppError(
                    error.response?.status || 502,
                    error.response?.data?.message || 'Unable to cancel payment'
                )
            }

            throw new AppError(
                500,
                error instanceof Error
                    ? error.message
                    : 'Unexpected payment cancellation error'
            )
        }
    }


    public reconcileExpiredPendingPayments = async():Promise<{
        checked:number
        approved:number
        stillPending:number
        expired:number
        unchanged:number
    }>=>{
        const accessToken = process.env.ACCESS_TOKEN?.trim()

        if(!accessToken){
            throw new AppError(500, "Payment service is not configured")
        }

        const payments = await this.paymentData.findExpiredPendingPayments()
        const results = await Promise.allSettled(payments.map(async(payment)=>{
            const response = await axios.get(
                `https://api.mercadopago.com/v1/payments/${payment.mercado_pago_id}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    timeout: 5000
                }
            )

            if(
                String(response.data?.id) !== payment.mercado_pago_id ||
                response.data?.external_reference !== payment.id
            ){
                throw new AppError(502, "Payment provider returned a mismatched payment")
            }

            let status = String(response.data?.status || '').toLowerCase()

            if(status === 'pending'){
                const cancellationResponse = await axios.put(
                    `https://api.mercadopago.com/v1/payments/${payment.mercado_pago_id}`,
                    { status: 'cancelled' },
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        timeout: 5000
                    }
                )

                if(
                    String(cancellationResponse.data?.id) !== payment.mercado_pago_id ||
                    cancellationResponse.data?.external_reference !== payment.id
                ){
                    throw new AppError(502, "Payment provider returned a mismatched cancellation")
                }

                status = String(cancellationResponse.data?.status || '').toLowerCase()
            }
            
            if(status === 'approved'){
                await this.paymentData.saveGatewayResult(
                    payment.id,
                    payment.mercado_pago_id,
                    status
                )
                return 'approved' as const
            }

            if(status === 'cancelled' || status === 'rejected'){
                const expired = await this.paymentData.expirePaymentAndRestoreStock(payment.id)
                return expired ? 'expired' as const : 'unchanged' as const
            }

            if(
                status === 'pending' ||
                status === 'in_process' ||
                status === 'authorized' ||
                status === 'in_mediation'
            ){
                await this.paymentData.saveGatewayResult(
                    payment.id,
                    payment.mercado_pago_id,
                    status
                )
                return 'stillPending' as const
            }

            console.warn(
                `Payment ${payment.id} has an unhandled Mercado Pago status: ${status || 'empty'}`
            )
            return 'unchanged' as const
        }))   

        const summary = {
            checked: payments.length,
            approved: 0,
            stillPending: 0,
            expired: 0,
            unchanged: 0
        }
        let failures = 0

        results.forEach((result, index)=>{
            if(result.status === 'rejected'){
                failures++
                console.error(
                    `Failed to reconcile payment ${payments[index].id}:`,
                    result.reason
                )
                return
            }

            summary[result.value]++
        })

        if(failures > 0){
            throw new AppError(502, `Failed to reconcile ${failures} expired payment(s)`)
        }

        return summary
    }
}