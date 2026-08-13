import { Router } from "express"
import ProviderNotificationData from "../data/ProviderNotificationData"
import ProviderNotificationBusiness from "../business/ProviderNotificationBusiness"
import ProviderNotificationController from "../controller/ProviderNotificationController"
import Services from "../services/Authentication"


export const providerNotificationRouter = Router()

const services = new Services()
const notificationData = new ProviderNotificationData()
const notificationBusiness = new ProviderNotificationBusiness(notificationData)
const notificationController = new ProviderNotificationController(notificationBusiness, services)


providerNotificationRouter.get('/', notificationController.findProviderNotifications)

providerNotificationRouter.put('/update/all', notificationController.updateAllProviderNotifications)
providerNotificationRouter.put('/update/:id', notificationController.updateProviderNotification)
