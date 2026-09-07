import argon2 from "argon2";
import crypto from "node:crypto";

import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { toId } from "../../utils/ids.js";
import { authRepository } from "./auth.repository.js";
import { userRepository } from "../user/user.repository.js";
import { sanitizeUser } from "../user/user.service.js";
import { ConflictError, UnauthenticatedError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../constants/index.js";

const uniqueUsername = async (displayName) => {
  const base = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 24) || "user";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = `${base}.${crypto.randomBytes(3).toString("hex")}`;
    const clash = await userRepository.findByUsername(username);
    if (!clash) return username;
  }
  return `${base}.${Date.now().toString(36)}`;
};

const issueSession = async (user) => {
  const userId = toId(user);
  const familyId = crypto.randomUUID();
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId, familyId);
  const refreshPayload = verifyRefreshToken(refreshToken);

  await authRepository.saveRefreshToken({
    userId,
    tokenHash: hashToken(refreshToken),
    familyId,
    expiresAt: new Date(refreshPayload.exp * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
};

export const authService = {
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("User with this email already exists.");
    }

    const passwordHash = await argon2.hash(password);
    const username = await uniqueUsername(name);

    const user = await userRepository.create({
      displayName: name.trim(),
      email: email.trim().toLowerCase(),
      username,
      passwordHash,
      isOnline: true,
    });

    return {
      ...(await issueSession(user)),
      message: "Registration successful.",
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthenticatedError(
        "Invalid email or password.",
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      );
    }

    await userRepository.updateById(toId(user), { isOnline: true });
    return {
      ...(await issueSession({ ...user, isOnline: true })),
      message: "Login successful.",
    };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthenticatedError(
        "Refresh token required.",
        ERROR_CODES.AUTH_UNAUTHENTICATED,
      );
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const stored = await authRepository.findRefreshByHash(tokenHash);

    if (!stored || stored.revokedAt) {
      await authRepository.revokeRefreshFamily(payload.familyId);
      throw new UnauthenticatedError(
        "Refresh token is no longer valid.",
        ERROR_CODES.AUTH_TOKEN_INVALID,
      );
    }

    await authRepository.revokeRefreshByHash(tokenHash);

    const accessToken = signAccessToken(payload.sub);
    const nextRefresh = signRefreshToken(payload.sub, payload.familyId);
    const nextPayload = verifyRefreshToken(nextRefresh);

    await authRepository.saveRefreshToken({
      userId: payload.sub,
      tokenHash: hashToken(nextRefresh),
      familyId: payload.familyId,
      expiresAt: new Date(nextPayload.exp * 1000),
    });

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthenticatedError(
        "Authentication required.",
        ERROR_CODES.AUTH_UNAUTHENTICATED,
      );
    }

    return {
      accessToken,
      refreshToken: nextRefresh,
      user: sanitizeUser(user),
    };
  },

  async logout({ accessJti, accessExp, refreshToken }) {
    if (accessJti) {
      await authRepository.revokeAccessJti(
        accessJti,
        accessExp ? new Date(accessExp * 1000) : undefined,
      );
    }

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await authRepository.revokeRefreshFamily(payload.familyId);
      } catch {
        // Access logout still succeeds if the refresh cookie is already dead.
      }
    }
  },

  async me(user) {
    return sanitizeUser(user);
  },

  async isTokenRevoked(jti) {
    return authRepository.isAccessJtiRevoked(jti);
  },
};
