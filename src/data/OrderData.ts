import ConnectToDatabase from "./Connexion"
import Orders from "../model/Order"
import { OrderModel, OrdersByMonthModel } from "../model/typesAndInterfaces"



export default class OrderData extends ConnectToDatabase{
    protected ORDER_TABLE = 'orders'
    protected USER_TABLE = 'users'

    
    public createOrder = async(order:Orders):Promise<void>=>{
        try{

            await order.save()

        }catch(e:any){
            throw new Error(`Error creating order: ${e.message || e}`)
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
        
    
    public deleteOrder = async(id:string):Promise<void>=>{
        try{
            
            await ConnectToDatabase.con(this.ORDER_TABLE).delete().where({ id })

        }catch(e:any){
            throw new Error(`Error deleting order: ${e.message || e}`)
        }

    }


    public updateOrderQuantity = async(quantity:number, id:string):Promise<void>=>{
        try{
            
            const order = await this.findOrderById(id)
            if(!order){
                throw new Error('Order not found')
            }
            
            await ConnectToDatabase.con(this.ORDER_TABLE).update({
              quantity,
              total: quantity * order.price
            }).where({ id })

        }catch(e:any){
            throw new Error(`Error updating order quantity: ${e.message || e}`)
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

            await ConnectToDatabase.con(this.ORDER_TABLE).delete().where({
                client,
                restaurant: provider,
                state: 'REQUESTED'
            })

        }catch(e:any){
            throw new Error(`Error clearing provider requested orders: ${e.message || e}`)
        }
    }
   
}