import { RefreshTokenModel } from "./refreshToken.model.js";
import { RevokedTokenModel } from "./revokedToken.model.js";

export const authRepository = {
  async revokeAccessJti(jti, expiresAt) {
    if (!jti) return;
    await RevokedTokenModel.updateOne(
      { jti },
      { jti, expiresAt: expiresAt ?? new Date(Date.now() + 15 * 60 * 1000) },
      { upsert: true },
    );
  },

  async isAccessJtiRevoked(jti) {
    if (!jti) return false;
    return Boolean(await RevokedTokenModel.exists({ jti }));
  },

  async saveRefreshToken({ userId, tokenHash, familyId, expiresAt }) {
    return RefreshTokenModel.create({
      user: userId,
      tokenHash,
      familyId,
      expiresAt,
    });
  },

  async findRefreshByHash(tokenHash) {
    return RefreshTokenModel.findOne({ tokenHash }).lean();
  },

  async revokeRefreshByHash(tokenHash) {
    await RefreshTokenModel.updateOne(
      { tokenHash, revokedAt: null },
      { revokedAt: new Date() },
    );
  },

  async revokeRefreshFamily(familyId) {
    if (!familyId) return;
    await RefreshTokenModel.updateMany(
      { familyId, revokedAt: null },
      { revokedAt: new Date() },
    );
  },
};
