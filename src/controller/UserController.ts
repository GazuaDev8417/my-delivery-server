import { Request, Response } from "express";
import UserBusiness, {
    SignupDTO,
    LoginDTO,
    RequestPasswordResetDTO,
    ConfirmPasswordResetDTO,
    UpdateUserProfileDTO
} from "../business/UserBusiness";
import { AddressDTO } from "../data/UserData";
import Services, { AppError } from "../services/Authentication";

export default class UserController {
    constructor(
        private userBusiness: UserBusiness,
        private services: Services
    ) {}


    private handleError(res: Response, error: any): void {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }

        res.status(500).json({
            message: error.message || "An unexpected internal server error occurred."
        });
    }

    public signup = async (req: Request, res: Response): Promise<void> => {
        try {
            const signupDTO: SignupDTO = req.body;
            const token = await this.userBusiness.signup(signupDTO);

            res.status(201).json({
                message: "User registered successfully",
                token
            });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const loginDTO: LoginDTO = req.body;
            const result = await this.userBusiness.login(loginDTO);

            res.status(200).json(result);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const authenticatedUser = await this.services.authenticateUser(req);
            const userProfile = await this.userBusiness.getProfileByUser(authenticatedUser.id);

            res.status(200).json(userProfile);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getProfileByUser = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.services.authenticateRestaurant(req);
            const { id } = req.params;

            const userProfile = await this.userBusiness.getProfileByUser(id);

            res.status(200).json(userProfile);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: RequestPasswordResetDTO = req.body;
            const previewUrl = await this.userBusiness.requestPasswordReset(dto);

            res.status(200).json(previewUrl);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public updatePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: ConfirmPasswordResetDTO = req.body;
            const user = await this.services.authenticateUser(req)
            await this.userBusiness.updatePassword(dto, user.id);

            res.status(200).json({ message: "Password updated successfully" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public registerAddress = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);
            const addressDTO: AddressDTO = req.body;

            await this.userBusiness.registerAddress(user.id, addressDTO);

            res.status(200).json({ message: "Address registered successfully" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);
            const updateDTO: UpdateUserProfileDTO = req.body;

            await this.userBusiness.updateUser(user.id, updateDTO);

            res.status(200).json({ message: "User profile updated successfully" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);
            await this.userBusiness.deleteUser(user.id);

            res.status(200).json({ message: "User account deleted successfully" });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };
    
}