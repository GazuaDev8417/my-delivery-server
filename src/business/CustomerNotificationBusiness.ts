import CustomerNotificationData, { CustomerNotifications } from "../data/CustomerNotificationData"
import moment from "moment-timezone"



export default class CustomerNotificationBusiness{
    constructor(
        private notificationData:CustomerNotificationData
    ){}



    private removeExpiredNotification = async(notifications:CustomerNotifications[], customerId:string):Promise<CustomerNotifications[]>=>{
        const startOfToday = moment().tz('America/Sao_Paulo').startOf('day')
        const validNotifications:CustomerNotifications[] = []

        for(const notification of notifications){
            const notificationDate = moment.tz(notification.created_at, 'America/Sao_Paulo').startOf('day')

            if(notificationDate.isBefore(startOfToday)){
                await this.notificationData.deleteCustomerNotification(customerId, notification.id)
            }else{
                validNotifications.push(notification)
            }
        }

        return validNotifications
    }

    public findCustomerNotifications = async(customerId:string):Promise<CustomerNotifications[]>=>{
        const notifications = await this.notificationData.getCustomerNotifications(customerId)
        const validNotifications = await this.removeExpiredNotification(notifications, customerId)

        return validNotifications
    }

    public updateCustomerNotification = async(customerId:string, id:string):Promise<void>=>{
        await this.notificationData.updateCustomerNotification(customerId, id)
    }

    public updateAllCustomerNotifications = async(customerId:string):Promise<void>=>{
        await this.notificationData.updateAllCustomerNotification(customerId)
    }

}