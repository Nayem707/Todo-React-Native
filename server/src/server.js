import "dotenv/config";

import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createSocketServer } from "./sockets/socket.server.js";

const start = async () => {
  await connectDatabase();

  const app = await createApp();
  const httpServer = http.createServer(app);

  const io = createSocketServer(httpServer);
  app.set("io", io);

  const server = httpServer.listen(env.PORT, () => {
    logger.info({ env: env.NODE_ENV, port: env.PORT }, "Server started");
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutting down");

    const forceTimer = setTimeout(() => {
      logger.fatal("Graceful shutdown timed out");
      process.exit(1);
    }, 10_000);
    forceTimer.unref();

    await new Promise((resolve) => {
      server.close(() => {
        logger.info("HTTP server closed");
        resolve();
      });
    });

    await new Promise((resolve) => {
      io.close(() => {
        logger.info("Socket.IO closed");
        resolve();
      });
    });

    await disconnectDatabase();
    process.exit(0);
  };

  ["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception — exiting");
    process.exit(1);
  });
};

start().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
