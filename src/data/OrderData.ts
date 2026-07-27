import ConnectToDatabase from "./Connexion"
import Orders from "../model/Order"
import { OrderModel } from "../model/typesAndInterfaces"



export default class OrderData extends ConnectToDatabase{
    protected ORDER_TABLE = 'orders'

    
    public createOrder = async(order:Orders):Promise<void>=>{
        try{

            await order.save()

        }catch(e:any){
            throw new Error(`Error creating order: ${e.message || e}`)
        }
    }


    public findRequestedOrder = async(product:string, client:string):Promise<OrderModel | undefined>=>{
        try{

            const [order] = await ConnectToDatabase.con(this.ORDER_TABLE).where({
                product, client, state: 'REQUESTED'
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

    
    public findAllOrders = async():Promise<OrderModel[]>=>{
        try{
            
            return await ConnectToDatabase.con(this.ORDER_TABLE)

        }catch(e:any){
            throw new Error(`Error fetching all orders: ${e.message || e}`)
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


    public findAllOrdersByClient = async(client:string):Promise<OrderModel[]>=>{
        try{
            
            return await ConnectToDatabase.con(this.ORDER_TABLE)
                .where({ client })
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