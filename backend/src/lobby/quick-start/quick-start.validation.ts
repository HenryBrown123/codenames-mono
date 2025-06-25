import { z } from "zod";

/**
 * Schema for quick start request
 */
export const quickStartRequestSchema = z.object({
  params: z.object({
    gameId: z.string().min(1, "Game ID is required"),
  }),
  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
});

/**
 * Type for the parsed quick start request
 */
export type ValidatedQuickStartRequest = z.infer<typeof quickStartRequestSchema>;

/**
 * Response schema for quick start
 */
export const quickStartResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      game: z.object({
        publicId: z.string(),
        status: z.string(),
      }),
      round: z.object({
        roundId: z.number(),
        roundNumber: z.number(),
      }),
      turn: z.object({
        turnId: z.number(),
      }),
    }),
  })
  .brand<"QuickStartApiResponse">();

/**
 * Type for the response schema
 */
export type QuickStartResponse = z.infer<typeof quickStartResponseSchema>;