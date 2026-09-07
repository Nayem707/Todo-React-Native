import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().max(80).default(""),
});

export const updateProfileBodySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    bio: z.string().trim().max(280).optional(),
  })
  .refine((value) => value.name !== undefined || value.bio !== undefined, {
    message: "Provide a name or bio to update.",
  });
