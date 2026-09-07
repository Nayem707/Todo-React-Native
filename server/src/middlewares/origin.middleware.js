import { env } from "../config/env.js";
import { ForbiddenError } from "../errors/AppError.js";

const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim());

/**
 * Reject cross-site mutations. Browsers always send Origin on POST from JS.
 * Native clients and Postman omit Origin and are allowed.
 */
export const requireTrustedOrigin = (req, _res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const origin = req.headers.origin;
  if (!origin) return next();
  if (!allowedOrigins.includes(origin)) {
    throw new ForbiddenError("Origin not allowed.");
  }
  next();
};
