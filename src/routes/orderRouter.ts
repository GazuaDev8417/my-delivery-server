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

// ==========================================
// Order Processing & Status Operations
// ==========================================

orderRouter.post("/", orderController.createOrder);

/**
 * @openapi
 * /orders/active:
 *   get:
 *     summary: Fetch active (REQUESTED) orders for the customer
 *     tags:
 *       - Orders
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       200:
 *         description: List of active orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: You haven't placed any active orders yet.
 */
orderRouter.get("/active", orderController.getActiveOrders);
orderRouter.get("/history", orderController.getFinishedOrders);

/**
 * @openapi
 * /orders/all:
 *   get:
 *     summary: Fetch all orders for the authenticated merchant
 *     tags:
 *       - Orders
 *     security:
 *       - MerchantAuth: []
 *     responses:
 *       200:
 *         description: List of merchant orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - Merchant token missing or invalid.
 *       404:
 *         description: Order list is empty.
 */
orderRouter.get("/all", orderController.getAllOrders);
orderRouter.get("/recent", orderController.getRecentOrders);
orderRouter.get("/by-month", orderController.ordersByMonth);
orderRouter.get("/user/:id", orderController.getActiveOrdersByUserId);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Fetch specific order details by ID
 *     tags:
 *       - Orders
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order details retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found.
 */
orderRouter.get("/:id", orderController.getOrderById);

// Order modifications & actions

/**
 * @openapi
 * /orders/{id}/quantity:
 *   patch:
 *     summary: Update the item quantity for an order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantity updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order quantity updated successfully.
 *       400:
 *         description: Invalid quantity value.
 */
orderRouter.patch("/:id/quantity", orderController.updateOrderQuantity);
orderRouter.patch("/finish_orders", orderController.finishAllClientOrders);

/**
 * @openapi
 * /orders/{id}/finish:
 *   patch:
 *     summary: Mark order status as finished (Merchant)
 *     tags:
 *       - Orders
 *     security:
 *       - MerchantAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order marked as finished.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status updated to finished.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Order not found.
 */
orderRouter.patch("/:id/finish", orderController.markOrderAsFinished);

/**
 * @openapi
 * /orders/{id}/revert:
 *   patch:
 *     summary: Revert order status back to requested (Merchant)
 *     tags:
 *       - Orders
 *     security:
 *       - MerchantAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order status reverted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status reverted to requested.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Order not found.
 */
orderRouter.patch("/:id/revert", orderController.revertOrderToRequested);

// Deletions & cleanups
orderRouter.delete("/history", orderController.clearOrderHistory);
orderRouter.delete("/provider/:id", orderController.clearRequestedOrders);

orderRouter.delete("/:id", orderController.deleteOrder);

// Payments integration
orderRouter.post("/payment", orderController.processPayment);
orderRouter.get("/payment/:id/status", orderController.getPaymentStatus);