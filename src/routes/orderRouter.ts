import { Router } from "express";
import OrderController from "../controller/OrderController";
import OrderBusiness from "../business/OrderBusiness";
import OrderData from "../data/OrderData";
import Services from "../services/Authentication";

export const orderRouter = Router();

// Instantiating dependencies
const services = new Services();
const orderData = new OrderData();
const orderBusiness = new OrderBusiness(orderData, services);
const orderController = new OrderController(orderBusiness, services);

// Order lifecycle routes
orderRouter.post("/", orderController.createOrder);
orderRouter.get("/active", orderController.getActiveOrders);
orderRouter.get("/history", orderController.getFinishedOrders);
orderRouter.get("/all", orderController.getAllOrders);
orderRouter.get("/recent", orderController.getRecentOrders);
orderRouter.get("/user/:id", orderController.getActiveOrdersByUserId);
orderRouter.get("/:id", orderController.getOrderById);

// Order modifications & actions
orderRouter.patch("/:id/quantity", orderController.updateOrderQuantity);
orderRouter.patch("/finish_orders", orderController.finishAllClientOrders);
orderRouter.patch("/:id/finish", orderController.markOrderAsFinished);
orderRouter.patch("/:id/revert", orderController.revertOrderToRequested);

// Deletions & cleanups
orderRouter.delete("/history", orderController.clearOrderHistory);
orderRouter.delete("/provider/:id", orderController.clearRequestedOrders);
orderRouter.delete("/:id", orderController.deleteOrder);

// Payments integration
orderRouter.post("/payment", orderController.processPayment);
orderRouter.get("/payment/:id/status", orderController.getPaymentStatus);