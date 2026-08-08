import { Router } from "express"
import NotificationController from "../controller/NotificationController"
import NotificationBusiness from "../business/NotificationBusiness"
import NotificationData from "../data/NotificationData"
import Services from "../services/Authentication"


export const notificationRouter = Router()

const services = new Services()
const notificationData = new NotificationData()
const notificationBusiness = new NotificationBusiness(notificationData)
const notificationController = new NotificationController(notificationBusiness, services)


notificationRouter.get('/', notificationController.findNotifications)

notificationRouter.put('/update/all', notificationController.updateAllNotifications)
notificationRouter.put('/update/:id', notificationController.updateNotification)
