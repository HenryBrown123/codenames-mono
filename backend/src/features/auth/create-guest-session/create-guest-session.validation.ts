import { z } from "zod";

export const createGuestRequestSchema = z.object({});

export type CreateGuestRequest = z.infer<typeof createGuestRequestSchema>;

export const createGuestResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      user: z.object({
        username: z.string().min(3),
      }),
      session: z
        .object({
          username: z.string(),
          token: z.string(),
        })
        .strict(),
    }),
  })
  .strict();

export type CreateGuestResponse = z.infer<typeof createGuestResponseSchema>;
