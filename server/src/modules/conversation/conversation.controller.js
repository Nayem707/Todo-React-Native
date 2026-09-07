import { asyncHandler } from "../../utils/asyncHandler.js";
import { conversationService } from "./conversation.service.js";
import { created, ok } from "../../utils/httpResponse.js";

export const conversationController = {
  list: asyncHandler(async (req, res) => {
    ok(res, await conversationService.getForUser(req.user.id));
  }),

  create: asyncHandler(async (req, res) => {
    const payload = await conversationService.createDirect(
      req.user.id,
      req.body.userId,
    );
    created(res, payload);
  }),

  getById: asyncHandler(async (req, res) => {
    ok(res, await conversationService.getByIdForUser(req.params.id, req.user.id));
  }),
};
