import rateLimit from "express-rate-limit";
import { env, isTest } from "../config/env.js";
import { RateLimitError } from "../errors/AppError.js";

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req, _res, next) => next(new RateLimitError()),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req, _res, next) => next(new RateLimitError()),
});
