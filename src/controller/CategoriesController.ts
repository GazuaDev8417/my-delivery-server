import { Request, Response } from "express"
import CategoriesBusiness from "../business/CategoriesBusiness";
import Services, { AppError } from "../services/Authentication"


export default class CategoryController{
    constructor(
        private categoryBusiness:CategoriesBusiness
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
    public findCategoryStatistics = async(req:Request, res:Response):Promise<void>=>{
        try {
            const restaurant = await new Services().authenticateRestaurant(req)
            const result = await this.categoryBusiness.findCategoryStatistics(restaurant.id)

            res.status(200).json(result);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }
}