import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  requireGroupManager,
  requireGroupMember,
} from "../conversation/conversation.access.js";
import { groupController } from "./group.controller.js";
import {
  addMembersBodySchema,
  createGroupBodySchema,
  groupIdParamsSchema,
  groupMemberParamsSchema,
  updateGroupBodySchema,
} from "./group.validation.js";

export const groupRoutes = Router();
groupRoutes.use(authenticate);

groupRoutes.post("/", validate(createGroupBodySchema), groupController.create);

groupRoutes.get(
  "/:id",
  validate(groupIdParamsSchema, "params"),
  requireGroupMember,
  groupController.getById,
);

groupRoutes.patch(
  "/:id",
  validate(groupIdParamsSchema, "params"),
  validate(updateGroupBodySchema),
  requireGroupManager,
  groupController.update,
);

groupRoutes.post(
  "/:id/members",
  validate(groupIdParamsSchema, "params"),
  validate(addMembersBodySchema),
  requireGroupManager,
  groupController.addMembers,
);

groupRoutes.delete(
  "/:id/members/:memberId",
  validate(groupMemberParamsSchema, "params"),
  requireGroupManager,
  groupController.removeMember,
);

groupRoutes.delete(
  "/:id/leave",
  validate(groupIdParamsSchema, "params"),
  requireGroupMember,
  groupController.leave,
);
