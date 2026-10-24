import ConnectToDatabase from "./Connexion"
import Orders from "../model/Order"
import { OrderModel, OrdersByMonthModel } from "../model/typesAndInterfaces"
import ProviderNotificationData from "./ProviderNotificationData"
import StockConflictError from "../errors/StockConflictError"
import { AppError } from "../services/Authentication"



export default class OrderData extends ConnectToDatabase{
    protected ORDER_TABLE = 'orders'
    protected USER_TABLE = 'users'
    protected PRODUCT_TABLE = 'products'

    
    public createOrder = async(order:Orders, productId:string, providerId:string, quantity:number):Promise<void>=>{
        if(!Number.isInteger(quantity) || quantity <= 0){
            throw new AppError(400, 'Quantity must be a positive integer')
        }

        try{
            await ConnectToDatabase.con.transaction(async(trx)=>{
                const updatedProducts = await trx(this.PRODUCT_TABLE)
                    .where({
                        id: productId,
                        provider: providerId
                    })
                    .where('stock', '>=', quantity)
                    .decrement('stock', quantity)
                    .returning('id')

                if(updatedProducts.length !== 1){
                    throw new StockConflictError()
                }

                await order.save(trx)
            })

        }catch(e:any){
            if(e instanceof StockConflictError){
                throw e
            }
            const message = e instanceof Error ? e.message : String(e)
            throw new Error(`Error creating order: ${message}`)
        }
    }


    public findRequestedOrder = async(product:string, price:number, description:string, client:string):Promise<OrderModel | undefined>=>{
        try{

            const [order] = await ConnectToDatabase.con(this.ORDER_TABLE).where({
                product, price, description, client, state: 'REQUESTED'
            })
            
            return order
        }catch(e:any){
            throw new Error(`Error fetching requested order: ${e.message || e}`)
        }
    }


    public findOrderById = async(id:string):Promise<OrderModel | undefined>=>{
        try{
            
            const [order] = await ConnectToDatabase.con(this.ORDER_TABLE).where({ id })
            
            return order
        }catch(e:any){
            throw new Error(`Error fetching order by ID: ${e.message || e}`)
        }
    }

    
    public findAllOrders = async(providerId:string):Promise<OrderModel[]>=>{
        try{
            
            return await ConnectToDatabase.con(this.ORDER_TABLE)
                .where({ provider: providerId })

        }catch(e:any){
            throw new Error(`Error fetching all orders: ${e.message || e}`)
        }
    }


    public findRecentOrders = async(providerId:string):Promise<OrderModel[]>=>{
        try{

            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth()

            const startOfLastMonth = new Date(year, month - 1, 1)
            const endOfCurrentMonth = new Date(year, month + 1, 0, 23, 59, 59)
            
            
            return await ConnectToDatabase.con(this.ORDER_TABLE)
                .join(this.USER_TABLE, `${this.USER_TABLE}.id`, `${this.ORDER_TABLE}.client`)
                .where(`${this.ORDER_TABLE}.provider`, providerId)
                .whereBetween(`${this.ORDER_TABLE}.moment`, [startOfLastMonth, endOfCurrentMonth])
                .select(
                    `${this.ORDER_TABLE}.id`,
                    `${this.USER_TABLE}.username`,
                    `${this.ORDER_TABLE}.product`,
                    `${this.ORDER_TABLE}.total`,
                    `${this.ORDER_TABLE}.state`
                ).distinct()

        }catch(e:any){
            throw new Error(`Error fetching all orders: ${e.message || e}`)
        }
    }


    public findOrdersByMonth = async(providerId:string):Promise<OrdersByMonthModel[]>=>{
        try{
            const allOrders = await this.findAllOrders(providerId)
            const monthCounts: { [key:string]:number } = {}

            for(const order of allOrders){
                const date = new Date(order.moment)
                const year = date.getUTCFullYear()
                const month = String(date.getUTCMonth() + 1).padStart(2, '0')
                const key = `${year}-${month}`

                monthCounts[key] = (monthCounts[key] || 0) + 1
            }

            const result:OrdersByMonthModel[] = Object.keys(monthCounts).map((key)=>({
                month: key,
                orders: monthCounts[key]
            }))

            result.sort((a, b) => b.month.localeCompare(a.month))

            return result
        }catch(e:any){
            throw new Error(`Error fetching orders by month: ${e.message || e}`)
        }
    }


    public findActiveOrdersByClient = async(client:string):Promise<OrderModel[]>=>{
        try{
            
            return await ConnectToDatabase.con(this.ORDER_TABLE)
                .where({ client, state: 'REQUESTED' })

        }catch(e:any){
            throw new Error(`Error fetching active orders: ${e.message || e}`)
        }
    }


    public findAllOrdersByClient = async(client:string, providerId:string):Promise<OrderModel[]>=>{
        try{
            
            return await ConnectToDatabase.con(this.ORDER_TABLE)
                .where({ client })
                .andWhere({ provider: providerId })
        }catch(e:any){
            throw new Error(`Error fetching client orders: ${e.message || e}`)
        }
    }


    public findFinishedOrdersByClient = async(client:string):Promise<OrderModel[]>=>{
        try{
            
            return await ConnectToDatabase.con(this.ORDER_TABLE)
                .where({ client, state: 'FINISHED' })

        }catch(e:any){
            throw new Error(`Error fetching finished orders: ${e.message || e}`)
        }
    }
        
    
    public deleteOrder = async(order:OrderModel):Promise<void>=>{
        let deleteOrder: OrderModel

        try{
            deleteOrder = await ConnectToDatabase.con.transaction(async (trx)=>{
                const currentOrder: OrderModel | undefined = await trx(this.ORDER_TABLE)
                    .where({ id: order.id })
                    .forUpdate()
                    .first()

                if(!currentOrder){
                    throw new AppError(404, 'Order not found')
                }

                if(currentOrder.state === 'REQUESTED'){
                    const restoredProducts = await trx(this.PRODUCT_TABLE)
                        .where({
                            id: currentOrder.productid,
                            provider: currentOrder.provider
                        })
                        .increment('stock', currentOrder.quantity)
                        .returning('id')

                    if(restoredProducts.length !== 1){
                        throw new Error('The product stock could not be restored.')
                    }
                }

                await trx(this.ORDER_TABLE)
                    .where({ id: currentOrder.id })
                    .delete()

                return currentOrder
            })
        }catch(e:unknown){
            if(e instanceof AppError){
                throw e
            }

            const message = e instanceof Error ? e.message : String(e)
            throw new Error(`Error deleting order: ${message}`)
        }

        try{
            await new ProviderNotificationData().saveProviderNofitication(
                `An order for ${deleteOrder.product} was removed`,
                deleteOrder.provider
            )
        }catch(e:unknown){
            console.error(
                `Order ${deleteOrder.id} was deleted, but the notification to the provider ${deleteOrder.provider} failed:`,
                e
            )
        }

    }


    public updateOrderQuantity = async(quantity:number, id:string):Promise<void>=>{
        if(!Number.isInteger(quantity) || quantity <= 0){
            throw new AppError(400, 'Quantity must be a positive integer')
        }

        try{
            await ConnectToDatabase.con.transaction(async(trx)=>{
                const order:OrderModel = await trx(this.ORDER_TABLE)
                    .where({ id })
                    .forUpdate()
                    .first()

                if(!order){
                    throw new AppError(404, 'Order not found')
                }

                if(order.state !== 'REQUESTED'){
                    throw new AppError(409, 'Only requested orders can be updated.')
                }

                const difference = quantity - order.quantity

                if(difference > 0){
                    const updated = await trx(this.PRODUCT_TABLE)
                        .where({
                            id: order.productid,
                            provider: order.provider
                        })
                        .where('stock', '>=', difference)
                        .decrement('stock', difference)
                        .returning('id')

                    if(updated.length !== 1){
                        throw new StockConflictError()
                    }
                }else if(difference < 0){
                    const restoredProducts = await trx(this.PRODUCT_TABLE)
                        .where({
                            id: order.productid,
                            provider: order.provider
                        })
                        .increment('stock', Math.abs(difference))
                        .returning('id')

                    if(restoredProducts.length !== 1){
                        throw new Error('The stock could not be restored: product from the order was not found.')
                    }
                }

                await trx(this.ORDER_TABLE)
                    .where({ id })
                    .update({
                        quantity: quantity,
                        total: quantity * order.price
                    })
            })
        }catch(e:unknown){
            if(e instanceof AppError || e instanceof StockConflictError){
                throw e
            }
            const message = e instanceof Error ? e.message : String(e)
            throw new Error(`Error updating quantity: ${message}`)
        }
    }


    public finishAllOrdersByClient = async(clientId:string):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.ORDER_TABLE).update({
                state: 'FINISHED'
            }).where({ client: clientId, state: 'REQUESTED' })

        }catch(e:any){
            throw new Error(`Error finishing all orders: ${e.message || e}`)
        }
    }


    public updateOrderStatusToFinished = async(id:string):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.ORDER_TABLE).update({
                state: 'FINISHED'
            }).where({ id })

        }catch(e:any){
            throw new Error(`Error marking order as finished: ${e.message || e}`)
        }
    }


    public updateOrderStatusToRequested = async(id:string):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.ORDER_TABLE).update({
                state: 'REQUESTED'
            }).where({ id })

        }catch(e:any){
            throw new Error(`Error reverting order to requested: ${e.message || e}`)
        }
    }


    public deleteFinishedOrdersByClient = async(client:string):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.ORDER_TABLE).delete().where({
                client,
                state: 'FINISHED'
            })


        }catch(e:any){
            throw new Error(`Error clearing finished order history: ${e.message || e}`)
        }
    }

    
    public deleteRequestedOrdersByProvider = async(client:string, provider:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con.transaction(async(trx)=>{
                const requestedOrders = await trx(this.ORDER_TABLE)
                    .select('id', 'productid', 'quantity')
                    .where({
                        client,
                        provider,
                        state: 'REQUESTED'
                    })
                    .forUpdate()

                if(requestedOrders.length === 0) return

                const quantityByProduct = new Map<string, number>()

                for(const order of requestedOrders){
                    const previousQuantity = quantityByProduct.get(order.productid) ?? 0
                    quantityByProduct.set(
                        order.productid,
                        previousQuantity + order.quantity
                    )
                }

                for(const [productId, quantity] of quantityByProduct){
                    const restoredProducts = await trx(this.PRODUCT_TABLE)
                        .where({ id: productId, provider })
                        .increment('stock', quantity)
                        .returning('id')

                    if(restoredProducts.length !== 1){
                        throw new Error(`The stock for product ${productId} could not be restored.`)
                    }
                }

                const orderIds = requestedOrders.map((order) => order.id)

                await trx(this.ORDER_TABLE)
                    .whereIn('id', orderIds)
                    .delete()
            })
        }catch(e:any){
            const message = e instanceof Error ? e.message : String(e)
            throw new Error(`Error clearing requested orders from provider: ${message}`)
        }
    }
   
}