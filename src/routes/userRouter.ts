import { Router } from "express";
import UserController from "../controller/UserController";
import UserBusiness from "../business/UserBusiness";
import UserData from "../data/UserData";
import Services from "../services/Authentication";
import TokenService from "../services/TokenService";
import EmailService from "../services/EmailService";

export const userRouter = Router();

// Dependency Injection Setup
const services = new Services();
const userData = new UserData();
const tokenService = new TokenService();
const emailService = new EmailService();
const userBusiness = new UserBusiness(userData, services, tokenService, emailService);
const userController = new UserController(userBusiness, services);

// ==========================================
// Authentication & Password Routes
// ==========================================
userRouter.post("/signup", userController.signup);

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Authenticate client & issue JWT token
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: visitor1@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful. Returns raw JWT token string.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing fields or invalid email format.
 *       401:
 *         description: Invalid email or password.
 */
userRouter.post("/login", userController.login);


userRouter.post("/password/reset-request", userController.requestPasswordReset);

// ==========================================
// Profile & Account Routes
// ==========================================

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Fetch all clients who ordered from the authenticated merchant
 *     tags:
 *       - Users
 *     security:
 *       - MerchantAuth: []
 *     responses:
 *       200:
 *         description: List of customers associated with the merchant retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "a81f3b20-1e23-4c56-8a90-123456789abc"
 *                   username:
 *                     type: string
 *                     example: Visitor One
 *                   email:
 *                     type: string
 *                     example: visitor@email.com
 *                   phone:
 *                     type: string
 *                     example: "71998887766"
 *       401:
 *         description: Unauthorized - Merchant token required.
 *       404:
 *         description: Users profile not found.
 */
userRouter.get("/", userController.getAllUsers);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Fetch authenticated client's profile details
 *     tags:
 *       - Users
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       200:
 *         description: Client profile data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "a81f3b20-1e23-4c56-8a90-123456789abc"
 *                 username:
 *                   type: string
 *                   example: Flamarion França
 *                 email:
 *                   type: string
 *                   example: flamarion@example.com
 *                 phone:
 *                   type: string
 *                   example: "71998887766"
 *                 street:
 *                   type: string
 *                   nullable: true
 *                   example: "Av. Sete de Setembro"
 *                 cep:
 *                   type: string
 *                   nullable: true
 *                   example: "40000000"
 *                 number:
 *                   type: string
 *                   nullable: true
 *                   example: "100"
 *                 neighbourhood:
 *                   type: string
 *                   nullable: true
 *                   example: "Barra"
 *                 city:
 *                   type: string
 *                   nullable: true
 *                   example: "Salvador"
 *                 state:
 *                   type: string
 *                   nullable: true
 *                   example: "BA"
 *                 complement:
 *                   type: string
 *                   nullable: true
 *                   example: "Apt 201"
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: User profile not found.
 */
userRouter.get("/profile", userController.getProfile);


userRouter.get("/profile/:id", userController.getProfileByUser);

/**
 * @openapi
 * /users/profile:
 *   put:
 *     summary: Update client basic profile info
 *     tags:
 *       - Users
 *     security:
 *       - CustomAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *                 example: Flamarion França
 *               email:
 *                 type: string
 *                 format: email
 *                 example: flamarion@example.com
 *               phone:
 *                 type: string
 *                 example: "71998887766"
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile updated successfully
 *       400:
 *         description: Missing required profile fields.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
userRouter.put("/profile", userController.updateUser);

/**
 * @openapi
 * /users/address:
 *   post:
 *     summary: Register or update client shipping address
 *     tags:
 *       - Users
 *     security:
 *       - CustomAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - cep
 *               - neighbourhood
 *               - city
 *               - state
 *             properties:
 *               street:
 *                 type: string
 *                 example: Av. Sete de Setembro
 *               cep:
 *                 type: string
 *                 example: "40000000"
 *               neighbourhood:
 *                 type: string
 *                 example: Barra
 *               city:
 *                 type: string
 *                 example: Salvador
 *               state:
 *                 type: string
 *                 example: BA
 *               number:
 *                 type: string
 *                 example: "100"
 *                 description: Required if complement is omitted
 *               complement:
 *                 type: string
 *                 example: Apt 201
 *                 description: Required if number is omitted
 *     responses:
 *       200:
 *         description: Address registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Address registered successfully
 *       400:
 *         description: Missing required fields or neither number nor complement provided.
 *       401:
 *         description: Unauthorized.
 */
userRouter.put("/address", userController.registerAddress);


userRouter.patch("/password/update", userController.updatePassword);

/**
 * @openapi
 * /users/account:
 *   delete:
 *     summary: Delete user account and associated history
 *     tags:
 *       - Users
 *     security:
 *       - CustomAuth: []
 *     responses:
 *       200:
 *         description: Account and associated data deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User account and all its data was deleted successfully
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - User has active orders that must be finished or canceled first.
 */
userRouter.delete("/account", userController.deleteUser);