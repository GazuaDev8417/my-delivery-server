import NotificationData, { Notifications } from "../data/NotificationData"



export default class NotificationBusiness{
    constructor(
        private notificationData:NotificationData
    ){}


    public findNotifications = async(providerId:string):Promise<Notifications[]>=>{
        const notifications = await this.notificationData.getNotifications(providerId) 

        return notifications
    }

    public updateNotification = async(providerId:string, id:string):Promise<void>=>{
        await this.notificationData.updateNotification(providerId, id)
    }

    public updateAllNotifications = async(providerId:string):Promise<void>=>{
        await this.notificationData.updateAllNotification(providerId)
    }

}