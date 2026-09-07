import { z } from "zod";
import { objectIdSchema } from "../../validation/common.js";

export const sendRequestBodySchema = z.object({
  recipientId: objectIdSchema,
});

export const requestIdParamsSchema = z.object({
  requestId: objectIdSchema,
});

export const statusParamsSchema = z.object({
  userId: objectIdSchema,
});
