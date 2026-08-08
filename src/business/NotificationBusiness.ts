import NotificationData, { Notifications } from "../data/NotificationData"
import moment from "moment-timezone"



export default class NotificationBusiness{
    constructor(
        private notificationData:NotificationData
    ){}



    private removeExpiredNotification = async(notifications:Notifications[], providerId:string):Promise<void>=>{
        const startOfToday = moment().tz('America/Sao_Paulo').startOf('day')

        for(const notification of notifications){
            const notificationDate = moment.tz(notification.created_at, 'America/Sao_Paulo').startOf('day')

            if(notificationDate.isBefore(startOfToday)){
                await this.notificationData.deleteNotification(providerId, notification.id)
            }
        }
    }

    public findNotifications = async(providerId:string):Promise<Notifications[]>=>{
        const notifications = await this.notificationData.getNotifications(providerId) 
        await this.removeExpiredNotification(notifications, providerId)

        return notifications
    }

    public updateNotification = async(providerId:string, id:string):Promise<void>=>{
        await this.notificationData.updateNotification(providerId, id)
    }

    public updateAllNotifications = async(providerId:string):Promise<void>=>{
        await this.notificationData.updateAllNotification(providerId)
    }

}