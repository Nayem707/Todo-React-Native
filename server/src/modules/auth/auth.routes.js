import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  authLimiter,
  validate(registerBodySchema),
  authController.register,
);
authRoutes.post(
  "/login",
  authLimiter,
  validate(loginBodySchema),
  authController.login,
);
authRoutes.post(
  "/refresh",
  authLimiter,
  validate(refreshBodySchema),
  authController.refresh,
);
authRoutes.post("/logout", authenticate, authController.logout);
authRoutes.get("/me", authenticate, authController.me);

export const authRouter = authRoutes;
