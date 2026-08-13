import ConnectToDatabase from "./Connexion"
import { randomUUID as uuidv4 } from 'crypto'


export interface CustomerNotifications{
    id:string
    notification:string
    is_read:boolean
    created_at:Date
}


export default class CustomerNotificationData extends ConnectToDatabase{
    protected MATRIX_CUSTOMER_NOTIFICATION_TABLE = 'matrix_customer_notifications'
    protected CUSTOMER_NOTIFICATION_TABLE = 'customer_notifications'
    protected USER_TABLE = 'users'
    

    saveCustomerNofitication = async(notification:string):Promise<void>=>{
        try{
            const notificationId = uuidv4()
            
            await ConnectToDatabase.con(this.MATRIX_CUSTOMER_NOTIFICATION_TABLE)
                .insert({
                    id: notificationId,
                    notification
                })

            const customers = await ConnectToDatabase.con(this.USER_TABLE).select('id')
            if(customers.length > 0){
                    const userNotifications = customers.map(c=>({
                    id: uuidv4(),
                    notification_id: notificationId,
                    customer_id: c.id,
                    is_read: false
                }))
                
                await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE).insert(userNotifications)
            }
        }catch(e:any){
            throw new Error(`Failed to save notification: ${e.message || e}`)
        }
    }


    updateCustomerNotification = async(customerId:string, id:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE)
                .update({ is_read: true })
                .where({
                    notification_id: id,
                    customer_id: customerId
                })
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


    getCustomerNotifications = async(customerId:string):Promise<CustomerNotifications[]>=>{
        try{  
            const notifications = await ConnectToDatabase.con(this.CUSTOMER_NOTIFICATION_TABLE)
                .join(
                    this.MATRIX_CUSTOMER_NOTIFICATION_TABLE, 
                    `${this.CUSTOMER_NOTIFICATION_TABLE}.notification_id`,
                    `${this.MATRIX_CUSTOMER_NOTIFICATION_TABLE}.id`
                ).select(
                    `${this.MATRIX_CUSTOMER_NOTIFICATION_TABLE}.id`,
                    `${this.MATRIX_CUSTOMER_NOTIFICATION_TABLE}.notification`,
                    `${this.MATRIX_CUSTOMER_NOTIFICATION_TABLE}.created_at`,
                    `${this.CUSTOMER_NOTIFICATION_TABLE}.is_read`,

                ).where(`${this.CUSTOMER_NOTIFICATION_TABLE}.customer_id`, customerId)
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