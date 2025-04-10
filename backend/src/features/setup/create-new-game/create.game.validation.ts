import { z } from "zod";
import { GAME_TYPE, GAME_FORMAT } from "@codenames/shared/types";

/**
 * Zod schema for validating create game requests
 * Ensures gameType and gameFormat are valid enum values
 */
export const createGameRequestSchema = z
  .object({
    gameType: z.enum([GAME_TYPE.SINGLE_DEVICE, GAME_TYPE.MULTI_DEVICE]),
    gameFormat: z.enum([
      GAME_FORMAT.QUICK,
      GAME_FORMAT.BEST_OF_THREE,
      GAME_FORMAT.ROUND_ROBIN,
    ]),
  })
  .strict();

/**
 * Type definition for create game request payload
 */
export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;

/**
 * Zod schema for validating create game responses
 * Defines the structure of successful game creation responses
 */
export const createGameResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      game: z.object({
        publicId: z.string().nonempty(),
        gameType: z.enum([GAME_TYPE.SINGLE_DEVICE, GAME_TYPE.MULTI_DEVICE]),
        gameFormat: z.enum([
          GAME_FORMAT.QUICK,
          GAME_FORMAT.BEST_OF_THREE,
          GAME_FORMAT.ROUND_ROBIN,
        ]),
        createdAt: z.date(),
      }),
    }),
  })
  .strict();

/**
 * Type definition for create game response payload
 */
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
