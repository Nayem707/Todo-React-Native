import mongoose from "mongoose";
import { env, isProd } from "./env.js";
import { logger } from "./logger.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  mongoose.set("debug", false);
  await mongoose.connect(env.DATABASE_URL, {
    autoIndex: !isProd,
    serverSelectionTimeoutMS: 5000,
  });

  if (isProd) {
    const { UserModel } = await import("../modules/user/user.model.js");
    const { ConversationModel } = await import(
      "../modules/conversation/conversation.model.js"
    );
    const { MessageModel } = await import("../modules/message/message.model.js");
    const { FriendshipModel } = await import(
      "../modules/friends/friendship.model.js"
    );
    const { RefreshTokenModel } = await import(
      "../modules/auth/refreshToken.model.js"
    );
    const { RevokedTokenModel } = await import(
      "../modules/auth/revokedToken.model.js"
    );
    await Promise.all([
      UserModel.syncIndexes(),
      ConversationModel.syncIndexes(),
      MessageModel.syncIndexes(),
      FriendshipModel.syncIndexes(),
      RefreshTokenModel.syncIndexes(),
      RevokedTokenModel.syncIndexes(),
    ]);
  }

  logger.info("Database connected");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info("Database disconnected");
}
