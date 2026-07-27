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

// Authentication & Password routes
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/password/reset-request", userController.requestPasswordReset);

// Profile & Account routes
userRouter.get("/profile", userController.getProfile);
userRouter.get("/profile/:id", userController.getProfileByUser);
userRouter.put("/profile", userController.updateUser);
userRouter.put("/address", userController.registerAddress);
userRouter.patch("/password/update", userController.updatePassword);
userRouter.delete("/account", userController.deleteUser);