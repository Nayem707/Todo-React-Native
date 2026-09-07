import mongoose from "mongoose";
import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/httpResponse.js";
import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../constants/index.js";

export const healthRouter = Router();

healthRouter.get(
  "/live",
  asyncHandler(async (_req, res) => ok(res, { status: "live" })),
);

healthRouter.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) {
      throw new AppError("Database not ready.", {
        status: 503,
        code: ERROR_CODES.INTERNAL,
      });
    }
    ok(res, { status: "ready", db: "ok" });
  }),
);
