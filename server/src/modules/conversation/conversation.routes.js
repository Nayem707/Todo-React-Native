import { Router } from "express";
import { conversationController } from "./conversation.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { messageRoutes } from "../message/message.routes.js";
import {
  conversationIdParamsSchema,
  createConversationBodySchema,
} from "./conversation.validation.js";

export const conversationRoutes = Router();
conversationRoutes.use(authenticate);
conversationRoutes.get("/", conversationController.list);
conversationRoutes.post(
  "/",
  validate(createConversationBodySchema),
  conversationController.create,
);
conversationRoutes.get(
  "/:id",
  validate(conversationIdParamsSchema, "params"),
  conversationController.getById,
);
conversationRoutes.use("/:id/messages", messageRoutes);
