import { asyncHandler } from "../../utils/asyncHandler.js";
import { groupService } from "./group.service.js";
import { created, ok } from "../../utils/httpResponse.js";

export const groupController = {
  create: asyncHandler(async (req, res) => {
    created(res, await groupService.create(req.user.id, req.body));
  }),

  getById: asyncHandler(async (req, res) => {
    ok(res, await groupService.getById(req.user.id, req.params.id));
  }),

  update: asyncHandler(async (req, res) => {
    ok(res, await groupService.update(req.user.id, req.params.id, req.body));
  }),

  addMembers: asyncHandler(async (req, res) => {
    ok(
      res,
      await groupService.addMembers(req.user.id, req.params.id, req.body.memberIds),
    );
  }),

  removeMember: asyncHandler(async (req, res) => {
    ok(
      res,
      await groupService.removeMember(
        req.user.id,
        req.params.id,
        req.params.memberId,
      ),
    );
  }),

  leave: asyncHandler(async (req, res) => {
    ok(res, await groupService.leave(req.user.id, req.params.id));
  }),
};
