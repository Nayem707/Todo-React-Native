import { z } from "zod";
import { objectIdSchema } from "../../validation/common.js";

export const conversationIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const createConversationBodySchema = z.object({
  userId: objectIdSchema,
  type: z.enum(["DIRECT"]).default("DIRECT"),
});
