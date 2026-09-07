import { Router } from "express";
import { messageController } from "./message.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { requireConversationMember } from "../conversation/conversation.access.js";
import { uploadMessageFile } from "../../middlewares/upload.middleware.js";
import {
  createMessageBodySchema,
  listMessagesQuerySchema,
  messageIdParamsSchema,
  messageParamsSchema,
  updateMessageBodySchema,
} from "./message.validation.js";

export const messageRoutes = Router({ mergeParams: true });

messageRoutes.use(authenticate);
messageRoutes.use(validate(messageParamsSchema, "params"));
messageRoutes.use(requireConversationMember);

messageRoutes.get(
  "/",
  validate(listMessagesQuerySchema, "query"),
  messageController.list,
);
messageRoutes.post(
  "/",
  validate(createMessageBodySchema),
  messageController.create,
);
messageRoutes.post(
  "/attachment",
  uploadMessageFile,
  messageController.createWithAttachment,
);
messageRoutes.patch(
  "/:messageId",
  validate(messageIdParamsSchema, "params"),
  validate(updateMessageBodySchema),
  messageController.update,
);
messageRoutes.delete(
  "/:messageId",
  validate(messageIdParamsSchema, "params"),
  messageController.remove,
);
