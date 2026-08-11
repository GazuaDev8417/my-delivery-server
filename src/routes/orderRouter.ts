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

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order item for the authenticated customer
 *     tags:
 *       - Orders
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - price
 *               - quantity
 *             properties:
 *               product:
 *                 type: string
 *                 example: Double Cheese Smash Burger
 *               price:
 *                 type: number
 *                 example: 29.9
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               photoUrl:
 *                 type: string
 *                 example: https://res.cloudinary.com/demo/image/upload/v1/burger.jpg
 *               description:
 *                 type: string
 *                 example: No onions, extra pickle sauce
 *               providerId:
 *                 type: string
 *                 example: "b92f4c31-2f34-5d67-9b01-234567890def"
 *     responses:
 *       201:
 *         description: Order item added successfully.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "'Double Cheese Smash Burger' was successfully added to your order list."
 *       400:
 *         description: Missing required order fields or invalid quantity.
 *       403:
 *         description: Active order already exists for this item.
 */
orderRouter.post("/", orderController.createOrder);

/**
 * @openapi
 * /orders/active:
 *   get:
 *     summary: Fetch active (REQUESTED) orders for the customer
 *     tags:
 *       - Orders
 *     security:
 *       - UserAuth: []
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
 *     summary: Fetch all orders for the authenticated merchant restaurant
 *     tags:
 *       - Orders
 *     security:
 *       - MerchantAuth: []
 *     responses:
 *       200:
 *         description: List of restaurant orders.
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
 *   put:
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

/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order record by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order successfully deleted.
 *       404:
 *         description: Order not found.
 */
orderRouter.delete("/:id", orderController.deleteOrder);

// Payments integration
orderRouter.post("/payment", orderController.processPayment);
orderRouter.get("/payment/:id/status", orderController.getPaymentStatus);