import { z } from "zod";
import {
  objectIdSchema,
  paginationQuerySchema,
} from "../../validation/common.js";

export const messageParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .passthrough();

export const messageIdParamsSchema = z.object({
  id: objectIdSchema,
  messageId: objectIdSchema,
});

export const listMessagesQuerySchema = paginationQuerySchema;

export const createMessageBodySchema = z.object({
  content: z.string().trim().min(1, "A message is required.").max(4000),
});

export const updateMessageBodySchema = z.object({
  content: z.string().trim().min(1, "A message is required.").max(4000),
});
