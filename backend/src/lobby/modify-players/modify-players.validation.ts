import { z } from "zod";

/**
 * Modify player schema used in both individual and batch operations. Only playerId is mandatory
 * as the other fields can be optionally updated.
 */
export const modifyPlayerSchema = z.object({
  playerId: z.number(),
  teamId: z.number().optional(),
  playerName: z.string().min(1).max(30).optional(),
});

/**
 * Request validation for single player modification request. PlayerId is retrieved
 * from path parameter.
 */
export const modifySinglePlayerRequestSchema = z.object({
  params: z.object({
    gameId: z.string(),
    playerId: z.number(),
  }),

  body: modifyPlayerSchema,

  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
});

export type ValidatedSinglePlayerRequest = z.infer<typeof modifyPlayerSchema>;

/**
 * Request validation for batch player modification request. PlayerIds are retrieved
 * from the request body.
 */
export const modifyBatchPlayersRequestSchema = z.object({
  params: z.object({
    gameId: z.string(),
  }),

  body: z.array(modifyPlayerSchema).min(1),

  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
});

export type ValidatedBatchPlayersRequest = z.infer<
  typeof modifyBatchPlayersRequestSchema
>;

export const singlePlayerResponseSchema = z.object({});
export const batchPlayersResponseSchema = z.object({});

export type SinglePlayerResponse = z.infer<typeof singlePlayerResponseSchema>;
export type BatchPlayersResponse = z.infer<typeof batchPlayersResponseSchema>;
