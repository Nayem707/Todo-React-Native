import { z } from "zod";
import { objectIdSchema } from "../../validation/common.js";

export const groupIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const groupMemberParamsSchema = z.object({
  id: objectIdSchema,
  memberId: objectIdSchema,
});

export const createGroupBodySchema = z.object({
  name: z.string().trim().min(1, "A group name is required.").max(80),
  description: z.string().trim().max(280).optional().default(""),
  memberIds: z.array(objectIdSchema).max(50).optional().default([]),
});

export const updateGroupBodySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(280).optional(),
  })
  .refine(
    (value) => value.name !== undefined || value.description !== undefined,
    { message: "Provide a name or description to update." },
  );

export const addMembersBodySchema = z.object({
  memberIds: z.array(objectIdSchema).min(1).max(50),
});
