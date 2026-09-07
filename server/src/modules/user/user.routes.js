import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { uploadSingle } from "../../middlewares/upload.middleware.js";
import {
  searchQuerySchema,
  updateProfileBodySchema,
} from "./user.validation.js";

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get(
  "/search",
  validate(searchQuerySchema, "query"),
  userController.search,
);
userRoutes.get("/me", userController.me);
userRoutes.patch(
  "/me",
  validate(updateProfileBodySchema),
  userController.updateMe,
);
userRoutes.post(
  "/me/avatar",
  uploadSingle("avatar"),
  userController.uploadAvatar,
);
userRoutes.post("/me/cover", uploadSingle("cover"), userController.uploadCover);
