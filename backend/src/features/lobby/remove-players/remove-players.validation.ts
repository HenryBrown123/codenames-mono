import { z } from "zod";

/**
 * Schema for removing players from a game
 */
export const removePlayersRequestSchema = z.object({
  params: z.object({
    gameId: z.string().min(1, "Game ID is required"),
    playerId: z.string().transform(Number),
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
  playerId: z.number(),
  gameId: z.number(),
  teamId: z.number().nullable(),
  playerName: z.string().optional(),
});

/**
 * Response schema for adding players
 */
export const removePlayersResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      players: z.array(playerResponseSchema),
    }),
  })
  .strict();

/**
 * Type for the response schema
 */
export type RemovePlayersResponse = z.infer<typeof removePlayersResponseSchema>;
