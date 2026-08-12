import ConnectToDatabase from "./Connexion"
import { randomUUID as uuidv4 } from 'crypto'


export interface CustomerNotifications{
    id:string
    notification:string
    is_read:boolean
    created_at:Date
}


export default class CustomerNotificationData extends ConnectToDatabase{
    protected CUSTOMER_NOTIFICATION_TABLE = 'customer_notifications'

    saveCustomerNofitication = async(notification:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE).insert({
                id: uuidv4(),
                notification
            })
        }catch(e:any){
            throw new Error(`Failed to save notification: ${e.message || e}`)
        }
    }


    updateCustomerNotification = async(customerId:string, id:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE)
                .update({ is_read: true })
                .where({ id, customer_id: customerId })
        }catch(e:any){
            throw new Error(`Failed to update notification: ${e.message || e}`)
        }
    }


    updateAllCustomerNotification = async(customerId:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE)
                .update({ is_read: true })
                .where({ customer_id: customerId })
        }catch(e:any){
            throw new Error(`Failed to update notification: ${e.message || e}`)
        }
    }


    getCustomerNotifications = async():Promise<CustomerNotifications[]>=>{
        try{
            const notifications = await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE)
                .orderBy('created_at', 'desc')
                .limit(10)
            
            return notifications
        }catch(e:any){
            throw new Error(`Failed to fetch notifications: ${e.message || e}`)
        }
    }


    deleteCustomerNotification = async(customerId:string, id:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE)
                .del()
                .where({ customer_id: customerId, id })
        }catch(e:any){
            throw new Error(`Failed to fetch notifications: ${e.message || e}`)
        }
    }
}