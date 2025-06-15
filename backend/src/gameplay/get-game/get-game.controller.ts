import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { getGameStateService } from "./get-game.service";
import { z } from "zod";

/**
 * Request validation schema for game state retrieval
 */
export const gameStateRequestSchema = z.object({
  params: z.object({
    gameId: z.string().min(1, "Game ID is required"),
  }),
  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
});

/**
 * Type definition for validated request
 */
export type ValidatedGameStateRequest = z.infer<typeof gameStateRequestSchema>;

/**
 * Dependencies required by the game state controller
 */
export type Dependencies = {
  getGameState: ReturnType<typeof getGameStateService>;
};

/**
 * Creates a controller for retrieving game state
 *
 * @param dependencies - Services required by the controller
 * @returns Express request handler function
 */
export const getGameStateController =
  ({ getGameState }: Dependencies) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedRequest = gameStateRequestSchema.parse({
        params: req.params,
        auth: req.auth,
      });

      const result = await getGameState({
        gameId: validatedRequest.params.gameId,
        userId: validatedRequest.auth.userId,
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            game: result.data,
          },
        });
      } else {
        if (result.error.status === "game-not-found") {
          res.status(404).json({
            success: false,
            error: "Game not found or you are not a player in this game",
            details: {
              code: "game-not-found",
              message:
                "The game may not exist, or you may need to join the game first",
              gameId: result.error.gameId,
            },
          });
        } else if (result.error.status === "unauthorized") {
          res.status(403).json({
            success: false,
            error: "You are not a player in this game",
            details: {
              code: "not-a-player",
              message: "You need to join this game before you can view it",
              userId: result.error.userId,
            },
          });
        } else {
          res.status(500).json({
            success: false,
            error: "An unexpected error occurred",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  };
