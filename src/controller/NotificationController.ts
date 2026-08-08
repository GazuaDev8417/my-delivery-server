import { Request, Response } from "express"
import NotificationBusiness from "../business/NotificationBusiness";
import Services, { AppError } from "../services/Authentication"


export default class NotificationController{
    constructor(
        private notificationBusiness:NotificationBusiness,
        private services:Services
    ){}


    private handleError(res: Response, error: any): void {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }

        res.status(500).json({
            message: error.message || "An unexpected internal server error occurred."
        });
    }

/* ENDPOINTS */
    public findNotifications = async(req:Request, res:Response):Promise<void>=>{
        try{
            const restaurant = await this.services.authenticateRestaurant(req)
            const notifications = await this.notificationBusiness.findNotifications(restaurant.id)

            res.status(200).json(notifications)
        }catch(error:any){
            this.handleError(res, error)
        }
    }


    public updateNotification = async(req:Request, res:Response):Promise<void>=>{
        try{
            const restaurant = await this.services.authenticateRestaurant(req)
            await this.notificationBusiness.updateNotification(restaurant.id, req.params.id)

            res.status(200).end()
        }catch(error:any){
            this.handleError(res, error)
        }
    }


    public updateAllNotifications = async(req:Request, res:Response):Promise<void>=>{
        try{
            console.log('NOthing here')
            const restaurant = await this.services.authenticateRestaurant(req)
            console.log('Not even the id', restaurant.id)
            await this.notificationBusiness.updateAllNotifications(restaurant.id)

            res.status(200).end()
        }catch(error:any){
            this.handleError(res, error)
        }
    }

}






