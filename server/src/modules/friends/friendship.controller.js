import { asyncHandler } from "../../utils/asyncHandler.js";
import { friendshipService } from "./friendship.service.js";
import { created, ok } from "../../utils/httpResponse.js";

export const friendshipController = {
  sendRequest: asyncHandler(async (req, res) => {
    created(
      res,
      await friendshipService.sendRequest(req.user.id, req.body.recipientId),
    );
  }),

  getFriends: asyncHandler(async (req, res) => {
    ok(res, await friendshipService.getFriends(req.user.id));
  }),

  getIncomingRequests: asyncHandler(async (req, res) => {
    ok(res, await friendshipService.getIncomingRequests(req.user.id));
  }),

  getSentRequests: asyncHandler(async (req, res) => {
    ok(res, await friendshipService.getSentRequests(req.user.id));
  }),

  getStatus: asyncHandler(async (req, res) => {
    ok(res, await friendshipService.getStatus(req.user.id, req.params.userId));
  }),

  accept: asyncHandler(async (req, res) => {
    ok(
      res,
      await friendshipService.acceptRequest(req.params.requestId, req.user.id),
    );
  }),

  reject: asyncHandler(async (req, res) => {
    ok(
      res,
      await friendshipService.rejectRequest(req.params.requestId, req.user.id),
    );
  }),

  cancel: asyncHandler(async (req, res) => {
    ok(
      res,
      await friendshipService.cancelRequest(req.params.requestId, req.user.id),
    );
  }),
};
