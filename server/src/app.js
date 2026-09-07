import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import morgan from "morgan";

import mongoose from "mongoose";
import { env, isDev } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./config/database.js";
import { apiRouter } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { requireTrustedOrigin } from "./middlewares/origin.middleware.js";

export const createApp = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }

  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  const allowedOrigins = env.CLIENT_URL.split(",").map((o) => o.trim());

  app.use(
    cors({
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(requireTrustedOrigin);

  if (isDev) {
    app.use(morgan(":method :status :url :response-time ms"));
  } else {
    app.use(
      pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) => req.url === "/api/health/live",
        },
        customLogLevel: (_req, res, err) => {
          if (err || res.statusCode >= 500) return "error";
          if (res.statusCode >= 400) return "warn";
          return "info";
        },
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
        msgCaseSensitivity: "lower",
      }),
    );
  }

  app.use(globalLimiter);

  app.use("/api", apiRouter);

  app.use("/uploads", authenticate, express.static(env.STORAGE_LOCAL_DIR));

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
