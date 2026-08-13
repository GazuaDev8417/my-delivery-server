import ProviderNotificationData, { ProviderNotifications } from "../data/ProviderNotificationData"
import moment from "moment-timezone"



export default class ProviderNotificationBusiness{
    constructor(
        private notificationData:ProviderNotificationData
    ){}



    private removeExpiredNotification = async(notifications:ProviderNotifications[], providerId:string):Promise<void>=>{
        const startOfToday = moment().tz('America/Sao_Paulo').startOf('day')

        for(const notification of notifications){
            const notificationDate = moment(notification.created_at).tz('America/Sao_Paulo')

            if(notificationDate.isBefore(startOfToday)){
                await this.notificationData.deleteCustomerNotification(providerId, notification.id)
            }
        }
    }

    public findProviderNotifications = async(providerId:string):Promise<ProviderNotifications[]>=>{
        const notifications = await this.notificationData.getProviderNotifications(providerId) 

        await this.removeExpiredNotification(notifications, providerId)

        return notifications
    }

    public updateProviderNotification = async(providerId:string, id:string):Promise<void>=>{
        await this.notificationData.updateProviderNotification(providerId, id)
    }

    public updateAllProviderNotifications = async(providerId:string):Promise<void>=>{
        await this.notificationData.updateAllProviderNotification(providerId)
    }

}