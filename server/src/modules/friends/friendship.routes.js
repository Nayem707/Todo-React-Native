import { Router } from "express";
import { friendshipController } from "./friendship.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  requestIdParamsSchema,
  sendRequestBodySchema,
  statusParamsSchema,
} from "./friendship.validation.js";

export const friendshipRoutes = Router();
friendshipRoutes.use(authenticate);

friendshipRoutes.get("/", friendshipController.getFriends);
friendshipRoutes.post(
  "/request",
  validate(sendRequestBodySchema),
  friendshipController.sendRequest,
);
friendshipRoutes.get(
  "/requests/incoming",
  friendshipController.getIncomingRequests,
);
friendshipRoutes.get("/requests/sent", friendshipController.getSentRequests);
friendshipRoutes.get(
  "/status/:userId",
  validate(statusParamsSchema, "params"),
  friendshipController.getStatus,
);
friendshipRoutes.patch(
  "/:requestId/accept",
  validate(requestIdParamsSchema, "params"),
  friendshipController.accept,
);
friendshipRoutes.patch(
  "/:requestId/reject",
  validate(requestIdParamsSchema, "params"),
  friendshipController.reject,
);
friendshipRoutes.delete(
  "/:requestId",
  validate(requestIdParamsSchema, "params"),
  friendshipController.cancel,
);
