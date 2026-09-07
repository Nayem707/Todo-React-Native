import { asyncHandler } from "../../utils/asyncHandler.js";
import { userService } from "./user.service.js";
import { ok } from "../../utils/httpResponse.js";
import { ValidationError } from "../../errors/AppError.js";

export const userController = {
  search: asyncHandler(async (req, res) => {
    ok(res, await userService.search(req.user.id, req.query.q || ""));
  }),

  me: asyncHandler(async (req, res) => {
    ok(res, await userService.getCurrentProfile(req.user));
  }),

  updateMe: asyncHandler(async (req, res) => {
    ok(res, await userService.updateCurrentProfile(req.user.id, req.body));
  }),

  uploadAvatar: asyncHandler(async (req, res) => {
    if (!req.file) throw new ValidationError("No file uploaded.");
    ok(
      res,
      await userService.updateCurrentProfile(req.user.id, {
        avatarUrl: `/uploads/${req.file.filename}`,
      }),
    );
  }),

  uploadCover: asyncHandler(async (req, res) => {
    if (!req.file) throw new ValidationError("No file uploaded.");
    ok(
      res,
      await userService.updateCurrentProfile(req.user.id, {
        coverUrl: `/uploads/${req.file.filename}`,
      }),
    );
  }),
};
