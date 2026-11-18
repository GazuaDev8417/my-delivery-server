import { Request, Response } from "express";
import OrderBusiness, { CreateOrderDTO, PaymentDTO } from "../business/OrderBusiness";
import Services, { AppError } from "../services/Authentication";
import { timingSafeEqual } from "crypto";



export default class OrderController {
    constructor(
        private orderBusiness: OrderBusiness,
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

    public createOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);
            const orderDTO: CreateOrderDTO = req.body;

            await this.orderBusiness.createOrder(user, orderDTO);

            res.status(201).send(`'${orderDTO.product}' was successfully added to your order list.`)
        } catch (error: any) {
            const statusCode = error.statusCode || 400
            const message = error.message || 'An unexpected error occurred'

            res.status(statusCode).send(message)
        }
    };

    public getOrderById = async (req: Request, res: Response): Promise<void> => {
        try {
            const actor = await this.services.authenticateActor(req)
            const { id } = req.params;
            const order = await this.orderBusiness.getOrderById(id as string, actor);

            res.status(200).json(order);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public deleteOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const actor = await this.services.authenticateActor(req)
            const { id } = req.params;
            await this.orderBusiness.deleteOrder(id as string, actor);

            res.status(200).json({ message: "Order successfully deleted." });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public clearRequestedOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);
            const providerId = req.params.id;

            await this.orderBusiness.clearRequestedOrders(user.id, providerId as string);

            res.status(204).send();
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public clearOrderHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);

            await this.orderBusiness.clearOrderHistory(user.id);

            res.status(204).send();
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public updateOrderQuantity = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req)
            const { id } = req.params;
            const { quantity } = req.body;

            await this.orderBusiness.updateOrderQuantity(id as string, quantity, user.id);

            res.status(200).json({ message: "Order quantity updated successfully." });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    
    public markOrderAsFinished = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.services.authenticateRestaurant(req);
            const { id } = req.params;

            await this.orderBusiness.markOrderAsFinished(
                id as string,
                restaurant.id
            );

            res.status(200).json({ message: "Order status updated to finished." });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public revertOrderToRequested = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.services.authenticateRestaurant(req);
            const { id } = req.params;

            await this.orderBusiness.revertOrderToRequested(
                id as string,
                restaurant.id
            );

            res.status(200).json({ message: "Order status reverted to requested." });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getActiveOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);
            const orders = await this.orderBusiness.getActiveOrders(user.id);

            res.status(200).json(orders);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getPaidOrders = async(req:Request, res:Response):Promise<void>=>{
        try{
            const user = await this.services.authenticateUser(req)
            const orders = await this.orderBusiness.getPaidOrders(user.id)

            res.status(200).json(orders)
        }catch(error:any){
            this.handleError(res, error)
        }
    }

    public getAllOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.services.authenticateRestaurant(req);
            const orders = await this.orderBusiness.getAllOrders(restaurant.id);

            res.status(200).json(orders);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    public getRecentOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.services.authenticateRestaurant(req);
            const recentOrders = await this.orderBusiness.getRecentOrders(restaurant.id);

            res.status(200).json(recentOrders);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    public ordersByMonth = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.services.authenticateRestaurant(req);
            const findOrdersByMonth = await this.orderBusiness.ordersByMonth(restaurant.id);

            res.status(200).json(findOrdersByMonth);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    public getActiveOrdersByUserId = async (req: Request, res: Response): Promise<void> => {
        try {
            const restaurant = await this.services.authenticateRestaurant(req);
            const { id } = req.params;

            const orders = await this.orderBusiness.getActiveOrdersByUserId(id as string, restaurant.id);

            res.status(200).json(orders);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getFinishedOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req);
            const orders = await this.orderBusiness.getFinishedOrders(user.id);

            res.status(200).json(orders);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public processPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req)
            const paymentDTO: PaymentDTO = req.body;
            const responseData = await this.orderBusiness.processPayment(paymentDTO, user);

            res.status(200).json({
                orderId: responseData.external_reference,
                status: responseData.status,
                id: responseData.id,
                paymentType: responseData.payment_type_id,
                qrCode: responseData.point_of_interaction?.transaction_data?.qr_code,
                qrCodeBase64: responseData.point_of_interaction?.transaction_data?.qr_code_base64,
                qrCodeLink: responseData.point_of_interaction?.transaction_data?.ticket_url 
                    || responseData.point_of_interaction?.transaction_data?.qr_code_link
            });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.services.authenticateUser(req)
            const { id } = req.params;
            const status = await this.orderBusiness.getPaymentStatus(id as string, user);

            res.status(200).json({ status });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };
    
    public reconcileExpiredPendingPayments = async(
        req:Request,
        res:Response
    ):Promise<void>=>{
        try{
            const conSecret = process.env.CRON_SECRET?.trim()

            if(!conSecret){
                throw new AppError(503, "Scheduled payment reconciliation is not configured")
            }

            const providedAuthorization = Buffer.from(req.header('authorization') || '')
            const expectedAuthorization = Buffer.from(`Bearer ${conSecret}`)

            if(
                providedAuthorization.length !== expectedAuthorization.length ||
                !timingSafeEqual(providedAuthorization, expectedAuthorization)
            ){
                throw new AppError(401, "Unauthorized")  
            }

            const result = await this.orderBusiness.reconcileExpiredPendingPayments()
            res.status(200).json(result)
        }catch(error:any){
            this.handleError(res, error)
        }
    }
}