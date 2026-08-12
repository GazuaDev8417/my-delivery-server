import { Router } from "express"
import CustomerNotificationData from "../data/CustomerNotificationData"
import CustomerNotificationBusiness from "../business/CustomerNotificationBusiness"
import CustomerNotificationController from "../controller/CustomerNotificationController"
import Services from "../services/Authentication"


export const customerNotificationRouter = Router()

const services = new Services()
const notificationData = new CustomerNotificationData()
const notificationBusiness = new CustomerNotificationBusiness(notificationData)
const notificationController = new CustomerNotificationController(notificationBusiness, services)


customerNotificationRouter.get('/', notificationController.findCustomerNotifications)

customerNotificationRouter.put('/update/all', notificationController.updateAllCustomerNotifications)
customerNotificationRouter.put('/update/:id', notificationController.updateCustomerNotification)
