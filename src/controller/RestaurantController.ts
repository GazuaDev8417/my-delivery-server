import { Request, Response } from "express";
import RestaurantBusiness, { 
    SignupRestaurantDTO, 
    LoginDTO, 
    CreateAndUpdateProductDTO,
    UpdateRestaurantDTO,
    RequestPasswordResetDTO,
    ConfirmPasswordResetDTO
} from "../business/RestaurantBusiness";
import Services, { AppError } from "../services/Authentication"



export default class RestaurantController {
    constructor(
        private restaurantBusiness: RestaurantBusiness,
        private services: Services
    ) {}



    private handleError(res: Response, error: any): void {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }

        res.status(500).json({ 
            message: error.message || "An unexpected error occurred on the server." 
        });
    }

    public signupRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const signupDTO: SignupRestaurantDTO = req.body;
            const token = await this.restaurantBusiness.signupRestaurant(signupDTO);

            res.status(201).json(token);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public loginRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const loginDTO: LoginDTO = req.body;
            const token = await this.restaurantBusiness.loginRestaurant(loginDTO);

            res.status(200).json(token);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getRestaurantById = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurantProfile = await this.services.authenticateRestaurant(req);
            const restaurant = await this.restaurantBusiness.getRestaurantById(restaurantProfile.id);

            res.status(200).json(restaurant);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public updateRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.services.authenticateRestaurant(req);
            const updateDTO: UpdateRestaurantDTO = req.body;

            await this.restaurantBusiness.updateRestaurant(restaurant.id, updateDTO);

            res.status(200).json({ message: "Restaurant data updated successfully" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    public getRestaurant = async (_req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.restaurantBusiness.getRestaurant();

            res.status(200).json(restaurant);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: RequestPasswordResetDTO = req.body;
            const previewUrl = await this.restaurantBusiness.requestPasswordReset(dto);

            res.status(200).json(previewUrl);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public updatePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: ConfirmPasswordResetDTO = req.body;
            const user = await this.services.authenticateRestaurant(req)
            await this.restaurantBusiness.updatePassword(dto, user.id);

            res.status(200).json({ message: "Password updated successfully" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    // ==================== PRODUCTS ====================

    public insertProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const reataurant = await this.services.authenticateRestaurant(req);
            const createProductDTO: CreateAndUpdateProductDTO = req.body;

            await this.restaurantBusiness.insertProduct(createProductDTO, reataurant.id);

            res.status(201).json({ message: "Product registered successfully!" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public updateProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.services.authenticateRestaurant(req);
            const { id } = req.params 
            const updateDTO: CreateAndUpdateProductDTO = req.body

            await this.restaurantBusiness.updateProduct(id, updateDTO);

            res.status(200).json({ message: "Product updated successfully!" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    public getAllProducts = async (_req: Request, res: Response): Promise<void> => {
        try {
            const products = await this.restaurantBusiness.getAllProducts();

            res.status(200).json(products);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    public aAllProductsByClientSide = async (_req: Request, res: Response): Promise<void> => {
        try {
            const productsByClientSide = await this.restaurantBusiness.aAllProductsByClientSide();

            res.status(200).json(productsByClientSide);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    public getProductById = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.services.authenticateRestaurant(req);
            const { id } = req.params;

            const product = await this.restaurantBusiness.getProductById(id);

            res.status(200).json(product);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public deleteProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.services.authenticateRestaurant(req);
            const { id } = req.params;

            const productName = await this.restaurantBusiness.deleteProduct(id);

            res.status(200).json({ message: `'${productName}' deleted successfully` });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };
    
}