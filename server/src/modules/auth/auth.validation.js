import { z } from "zod";
import { passwordSchema } from "../../validation/common.js";

export const registerBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email: z.string().trim().email("A valid email is required.").toLowerCase(),
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("A valid email is required.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export const refreshBodySchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .default({});
