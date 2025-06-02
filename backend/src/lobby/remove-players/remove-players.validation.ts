import { z } from "zod";

/**
 * Schema for removing players from a game
 */
export const removePlayersRequestSchema = z.object({
  params: z.object({
    gameId: z.string().min(1, "Game ID is required"),
    playerId: z.string().uuid("Player ID must be a valid UUID"),
  }),
  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
});

/**
 * Type for the parsed remove players request
 */
export type ValidatedRemovePlayersRequest = z.infer<
  typeof removePlayersRequestSchema
>;

/**
 * Schema for a player in the response
 */
const playerResponseSchema = z.object({
  id: z.string(),
  playerName: z.string(),
  username: z.string().optional(),
  teamName: z.string(),
  isActive: z.boolean(),
});

/**
 * Response schema for removing players
 */
export const removePlayersResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      removedPlayer: playerResponseSchema,
      gameId: z.string(),
    }),
  })
  .strict();

/**
 * Type for the response schema
 */
export type RemovePlayersResponse = z.infer<typeof removePlayersResponseSchema>;
