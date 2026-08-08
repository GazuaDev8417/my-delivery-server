import ConnectToDatabase from "./Connexion"
import { v4 as uuidv4 } from 'uuid'


export interface Notifications{
    id:string
    user_id:string
    message:string
    is_read:boolean
    created_at:Date
}


export default class NotificationData extends ConnectToDatabase{
    protected NOTIFICATION_TABLE = 'notifications'

    saveNofitication = async(providerId:string, message:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.NOTIFICATION_TABLE).insert({
                id: uuidv4(),
                user_id: providerId,
                message
            })
        }catch(e:any){
            throw new Error(`Failed to save notification: ${e.message || e}`)
        }
    }


    updateNotification = async(providerId:string, id:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.NOTIFICATION_TABLE)
                .update({ is_read: true })
                .where({ user_id: providerId, id })
        }catch(e:any){
            throw new Error(`Failed to update notification: ${e.message || e}`)
        }
    }


    updateAllNotification = async(providerId:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.NOTIFICATION_TABLE)
                .update({ is_read: true })
                .where({ user_id: providerId })
        }catch(e:any){
            throw new Error(`Failed to update notification: ${e.message || e}`)
        }
    }


    getNotifications = async(providerId:string):Promise<Notifications[]>=>{
        try{
            const notifications = await ConnectToDatabase.con(this.NOTIFICATION_TABLE)
                .where({ user_id: providerId })
                .orderBy('created_at', 'desc')
                .limit(10)
            
            return notifications
        }catch(e:any){
            throw new Error(`Failed to fetch notifications: ${e.message || e}`)
        }
    }


    deleteNotification = async(providerId:string, id:string):Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.NOTIFICATION_TABLE)
                .del()
                .where({ user_id: providerId, id })
        }catch(e:any){
            throw new Error(`Failed to fetch notifications: ${e.message || e}`)
        }
    }
}