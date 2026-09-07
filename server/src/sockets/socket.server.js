import { Server } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { authService } from "../modules/auth/auth.service.js";
import { userRepository } from "../modules/user/user.repository.js";
import { conversationRepository } from "../modules/conversation/conversation.repository.js";
import { findActiveMember } from "../modules/conversation/conversation.members.js";

const socketsByUser = new Map();

const addPresence = (userId, socketId) => {
  let sockets = socketsByUser.get(userId);
  if (!sockets) {
    sockets = new Set();
    socketsByUser.set(userId, sockets);
  }
  const becameOnline = sockets.size === 0;
  sockets.add(socketId);
  return becameOnline;
};

const removePresence = (userId, socketId) => {
  const sockets = socketsByUser.get(userId);
  if (!sockets) return true;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    socketsByUser.delete(userId);
    return true;
  }
  return false;
};

export const createSocketServer = (httpServer) => {
  const allowedOrigins = env.CLIENT_URL.split(",").map((o) => o.trim());

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return next(new Error("auth_error"));
    try {
      const payload = verifyAccessToken(token);
      if (await authService.isTokenRevoked(payload.jti)) {
        return next(new Error("auth_error"));
      }
      const user = await userRepository.findById(payload.sub);
      if (!user) return next(new Error("auth_error"));
      socket.userId = user.id ?? user._id.toString();
      next();
    } catch {
      next(new Error("auth_error"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;
    logger.debug({ socketId: socket.id, userId }, "Socket connected");

    socket.join(`user:${userId}`);
    if (addPresence(userId, socket.id)) {
      userRepository.updateById(userId, { isOnline: true }).catch(() => {});
      socket.broadcast.emit("user_online", { userId });
    }

    socket.on("join_conversation", async ({ conversationId } = {}) => {
      if (!conversationId) return;
      const conversation = await conversationRepository.findById(conversationId);
      if (findActiveMember(conversation, userId)) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("leave_conversation", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("typing_start", ({ conversationId } = {}) => {
      if (!conversationId) return;
      if (!socket.rooms.has(`conversation:${conversationId}`)) return;
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId,
        state: "start",
      });
    });

    socket.on("typing_stop", ({ conversationId } = {}) => {
      if (!conversationId) return;
      if (!socket.rooms.has(`conversation:${conversationId}`)) return;
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId,
        state: "stop",
      });
    });

    socket.on("disconnect", (reason) => {
      logger.debug(
        { socketId: socket.id, userId, reason },
        "Socket disconnected",
      );
      if (removePresence(userId, socket.id)) {
        const lastSeenAt = new Date();
        userRepository
          .updateById(userId, { isOnline: false, lastSeenAt })
          .catch(() => {});
        socket.broadcast.emit("user_offline", {
          userId,
          lastSeenAt: lastSeenAt.toISOString(),
        });
      }
    });
  });

  return io;
};
