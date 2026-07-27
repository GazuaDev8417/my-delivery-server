import { Router } from "express";
import { upload, uploadToCloudinary } from "../config/multer";
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

// Authentication & Profile routes
restaurantRouter.post("/signup", restaurantController.signupRestaurant);
restaurantRouter.post("/login", restaurantController.loginRestaurant);
restaurantRouter.post("/password/reset-request", restaurantController.requestPasswordReset);
restaurantRouter.get("/profile", restaurantController.getRestaurantById);
restaurantRouter.get("/", restaurantController.getRestaurant);

// Products routes
restaurantRouter.get("/products", restaurantController.getAllProducts);
restaurantRouter.get("/product/:id", restaurantController.getProductById);
restaurantRouter.post("/product", upload.single('image'), uploadToCloudinary, restaurantController.insertProduct);
restaurantRouter.put("/product/:id", upload.single('image'), uploadToCloudinary, restaurantController.updateProduct);
restaurantRouter.put("/update", restaurantController.updateRestaurant);
restaurantRouter.patch("/password/update", restaurantController.updatePassword);
restaurantRouter.delete("/product/:id", restaurantController.deleteProduct);
