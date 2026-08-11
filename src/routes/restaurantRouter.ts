import { Router } from "express";
import { upload, uploadToCloudinary } from "../config/multer";
import { uploadLocal } from "../config/duplicateUpload";
import RestaurantController from "../controller/RestaurantController";
import RestaurantBusiness from "../business/RestaurantBusiness";
import RestaurantData from "../data/RestaurantData";
import Services from "../services/Authentication";
import TokenService from "../services/TokenService";
import EmailService from "../services/EmailService";

export const restaurantRouter = Router();

// Instantiating dependencies
const services = new Services();
const tokenService = new TokenService()
const emailService = new EmailService()
const restaurantData = new RestaurantData();
const restaurantBusiness = new RestaurantBusiness(restaurantData, services, tokenService, emailService);
const restaurantController = new RestaurantController(restaurantBusiness, services);

// ==========================================
// Merchant Restaurant Authentication & Profile
// ==========================================

/**
 * @openapi
 * /restaurants/signup:
 *   post:
 *     summary: Register a new merchant restaurant
 *     tags:
 *       - Restaurants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *               - email
 *               - password
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Burger King Express
 *               address:
 *                 type: string
 *                 example: Av. Tancredo Neves, 1000
 *               phone:
 *                 type: string
 *                 example: "71999887766"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: merchant@burgerking.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecretPass123!
 *               description:
 *                 type: string
 *                 example: Flame-broiled burgers and crispy fries delivered fast.
 *               logourl:
 *                 type: string
 *                 format: uri
 *                 example: https://res.cloudinary.com/demo/image/upload/v1/logo.png
 *     responses:
 *       201:
 *         description: Restaurant registered successfully. Returns raw JWT bearer token string.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing required registration fields.
 *       409:
 *         description: Restaurant email is already registered.
 */
restaurantRouter.post("/signup", restaurantController.signupRestaurant);

/**
 * @openapi
 * /restaurants/login:
 *   post:
 *     summary: Authenticate merchant & issue JWT token
 *     tags:
 *       - Restaurants
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
 *                 example: merchant@burgerking.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecretPass123!
 *     responses:
 *       200:
 *         description: Login successful. Returns raw Merchant JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing email or password.
 *       401:
 *         description: Invalid merchant credentials.
 */
restaurantRouter.post("/login", restaurantController.loginRestaurant);
restaurantRouter.post("/password/reset-request", restaurantController.requestPasswordReset);

/**
 * @openapi
 * /restaurants/profile:
 *   get:
 *     summary: Fetch authenticated merchant restaurant details
 *     tags:
 *       - Restaurants
 *     security:
 *       - MerchantAuth: []
 *     responses:
 *       200:
 *         description: Merchant profile data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "b92f4c31-2f34-5d67-9b01-234567890def"
 *                 name:
 *                   type: string
 *                   example: Burger King Express
 *                 email:
 *                   type: string
 *                   example: merchant@burgerking.com
 *                 phone:
 *                   type: string
 *                   example: "71999887766"
 *                 address:
 *                   type: string
 *                   example: Av. Tancredo Neves, 1000
 *                 description:
 *                   type: string
 *                   example: Flame-broiled burgers and crispy fries delivered fast.
 *                 logourl:
 *                   type: string
 *                   nullable: true
 *                   example: https://res.cloudinary.com/demo/image/upload/v1/logo.png
 *       401:
 *         description: Unauthorized - Merchant token missing or invalid.
 *       404:
 *         description: Restaurant not found.
 */
restaurantRouter.get("/profile", restaurantController.getRestaurantById);


restaurantRouter.get("/", restaurantController.getRestaurant);

// ==========================================
// Product Catalog & Management Operations
// ==========================================

/**
 * @openapi
 * /restaurants/products:
 *   get:
 *     summary: Fetch all menu products for the authenticated merchant
 *     tags:
 *       - Restaurants
 *     security:
 *       - MerchantAuth: []
 *     responses:
 *       200:
 *         description: List of products belonging to the merchant retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "p1234567-89ab-cdef-0123-456789abcdef"
 *                   name:
 *                     type: string
 *                     example: Double Cheese Smash Burger
 *                   price:
 *                     type: number
 *                     example: 29.9
 *                   category:
 *                     type: string
 *                     example: Burgers
 *                   description:
 *                     type: string
 *                     example: Two smash patties with melted cheddar and special sauce.
 *                   photoUrl:
 *                     type: string
 *                     example: https://res.cloudinary.com/demo/image/upload/v1/burger.jpg
 *                   provider:
 *                     type: string
 *                     example: "b92f4c31-2f34-5d67-9b01-234567890def"
 *       401:
 *         description: Unauthorized - Merchant token missing or invalid.
 *       404:
 *         description: Menu is empty.
 */
restaurantRouter.get("/products", restaurantController.getAllProducts);
restaurantRouter.get("/clientside-products/:id", restaurantController.aAllProductsByClientSide);

/**
 * @openapi
 * /restaurants/product/{id}:
 *   get:
 *     summary: Fetch a specific product by ID
 *     tags:
 *       - Restaurants
 *     security:
 *       - MerchantAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "p1234567-89ab-cdef-0123-456789abcdef"
 *                 name:
 *                   type: string
 *                   example: Double Cheese Smash Burger
 *                 price:
 *                   type: number
 *                   example: 29.9
 *                 category:
 *                   type: string
 *                   example: Burgers
 *                 description:
 *                   type: string
 *                   example: Two smash patties with melted cheddar and special sauce.
 *                 photoUrl:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v1/burger.jpg
 *                 provider:
 *                   type: string
 *                   example: "b92f4c31-2f34-5d67-9b01-234567890def"
 *       401:
 *         description: Unauthorized - Merchant token missing or invalid.
 *       404:
 *         description: Product not found.
 */
restaurantRouter.get("/product/:id", restaurantController.getProductById);
restaurantRouter.post("/product",  upload.single('image'), uploadToCloudinary , restaurantController.insertProduct);
restaurantRouter.put("/product/:id", upload.single('image'), uploadToCloudinary , restaurantController.updateProduct);
// restaurantRouter.post("/product",  uploadLocal.single('image'), restaurantController.insertProduct);
// restaurantRouter.put("/product/:id", uploadLocal.single('image'), restaurantController.updateProduct);

/**
 * @openapi
 * /restaurants/update:
 *   put:
 *     summary: Update merchant basic profile details
 *     tags:
 *       - Restaurants
 *     security:
 *       - MerchantAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Burger King Express - Salvador
 *               phone:
 *                 type: string
 *                 example: "71999887766"
 *               address:
 *                 type: string
 *                 example: Av. Tancredo Neves, 1005 - Store 12
 *     responses:
 *       200:
 *         description: Restaurant profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restaurant data updated successfully
 *       400:
 *         description: Missing required profile fields.
 *       401:
 *         description: Unauthorized - Merchant token missing or invalid.
 */
restaurantRouter.put("/update", restaurantController.updateRestaurant);
restaurantRouter.patch("/password/update", restaurantController.updatePassword);

/**
 * @openapi
 * /restaurants/product/{id}:
 *   delete:
 *     summary: Delete a product from the menu catalog
 *     tags:
 *       - Restaurants
 *     security:
 *       - MerchantAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "'Double Cheese Smash Burger' deleted successfully"
 *       401:
 *         description: Unauthorized - Merchant token missing or invalid.
 *       404:
 *         description: Product not found.
 */
restaurantRouter.delete("/product/:id", restaurantController.deleteProduct);
