import ConnectToDatabase from "./Connexion"
import { randomUUID as uuidv4 } from 'crypto'


export interface ProviderNotifications{
    id:string
    notification:string
    is_read:boolean
    created_at:Date
}


export default class ProviderNotificationData extends ConnectToDatabase{
    protected MATRIX_PROVIDER_NOTIFICATION_TABLE = 'matrix_provider_notifications'
    protected PROVIDER_NOTIFICATION_TABLE = 'provider_notifications'
    protected USER_TABLE = 'restaurants'
    

    saveProviderNofitication = async(notification:string):Promise<void>=>{
        try{
            const notificationId = uuidv4()
            
            await ConnectToDatabase.con(this.MATRIX_PROVIDER_NOTIFICATION_TABLE)
                .insert({
                    id: notificationId,
                    notification
                })

            const customers = await ConnectToDatabase.con(this.USER_TABLE).select('id')
            if(customers.length > 0){
                    const userNotifications = customers.map(c=>({
                    id: uuidv4(),
                    notification_id: notificationId,
                    user_id: c.id,
                    is_read: false
                }))
                
                await ConnectToDatabase.con(this.PROVIDER_NOTIFICATION_TABLE).insert(userNotifications)
            }
        }catch(e:any){
            throw new Error(`Failed to save notification: ${e.message || e}`)
        }
    }


    updateProviderNotification = async(userId:string, id:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.PROVIDER_NOTIFICATION_TABLE)
                .update({ is_read: true })
                .where({
                    notification_id: id,
                    user_id: userId
                })
        }catch(e:any){
            throw new Error(`Failed to update notification: ${e.message || e}`)
        }
    }


    updateAllProviderNotification = async(userId:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.PROVIDER_NOTIFICATION_TABLE)
                .update({ is_read: true })
                .where({ user_id: userId })
        }catch(e:any){
            throw new Error(`Failed to update notification: ${e.message || e}`)
        }
    }


    getProviderNotifications = async(userId:string):Promise<ProviderNotifications[]>=>{
        try{  
            const notifications = await ConnectToDatabase.con(this.PROVIDER_NOTIFICATION_TABLE)
                .join(
                    this.MATRIX_PROVIDER_NOTIFICATION_TABLE, 
                    `${this.PROVIDER_NOTIFICATION_TABLE}.notification_id`,
                    `${this.MATRIX_PROVIDER_NOTIFICATION_TABLE}.id`
                ).select(
                    `${this.MATRIX_PROVIDER_NOTIFICATION_TABLE}.id`,
                    `${this.MATRIX_PROVIDER_NOTIFICATION_TABLE}.notification`,
                    `${this.MATRIX_PROVIDER_NOTIFICATION_TABLE}.created_at`,
                    `${this.PROVIDER_NOTIFICATION_TABLE}.is_read`,

                ).where(`${this.PROVIDER_NOTIFICATION_TABLE}.user_id`, userId)

            return notifications
        }catch(e:any){
            throw new Error(`Failed to fetch notifications: ${e.message || e}`)
        }
    }


    deleteCustomerNotification = async(userId:string, id:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.PROVIDER_NOTIFICATION_TABLE)
                .del()
                .where({ user_id: userId, id })
        }catch(e:any){
            throw new Error(`Failed to delete notifications: ${e.message || e}`)
        }
    }
}