import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import { env } from "../config/env.js";
import { ERROR_CODES } from "../constants/index.js";
import { UnauthenticatedError } from "../errors/AppError.js";

const ACCESS_OPTIONS = {
  expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  algorithm: "HS256",
};

const REFRESH_OPTIONS = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  algorithm: "HS256",
};

const VERIFY_ACCESS = { algorithms: ["HS256"] };
const VERIFY_REFRESH = { algorithms: ["HS256"] };

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.JWT_ACCESS_SECRET, ACCESS_OPTIONS);

export const signRefreshToken = (userId, familyId) =>
  jwt.sign(
    { sub: userId, jti: crypto.randomUUID(), familyId, typ: "refresh" },
    env.JWT_REFRESH_SECRET,
    REFRESH_OPTIONS,
  );

const verify = (token, secret, options, expiredMessage) => {
  try {
    return jwt.verify(token, secret, options);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthenticatedError(
        expiredMessage,
        ERROR_CODES.AUTH_TOKEN_EXPIRED,
      );
    }
    throw new UnauthenticatedError(
      "Invalid token.",
      ERROR_CODES.AUTH_TOKEN_INVALID,
    );
  }
};

export const verifyAccessToken = (token) =>
  verify(
    token,
    env.JWT_ACCESS_SECRET,
    VERIFY_ACCESS,
    "Token has expired.",
  );

export const verifyRefreshToken = (token) => {
  const payload = verify(
    token,
    env.JWT_REFRESH_SECRET,
    VERIFY_REFRESH,
    "Refresh token has expired.",
  );
  if (payload.typ !== "refresh" || !payload.familyId) {
    throw new UnauthenticatedError(
      "Invalid token.",
      ERROR_CODES.AUTH_TOKEN_INVALID,
    );
  }
  return payload;
};
