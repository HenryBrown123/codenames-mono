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
  query: z.object({
    playerId: z.string().min(1, "Player ID is required").optional(),
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
        query: req.query,
        auth: req.auth,
      });

      const result = await getGameState({
        gameId: validatedRequest.params.gameId,
        playerId: validatedRequest.query.playerId || null,
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
            error: "You are not authorized to view this player's context",
            details: {
              code: "not-authorized",
              message: "You can only view your own player context in multi-device mode",
              userId: result.error.userId,
            },
          });
        } else if (result.error.status === "player-not-found") {
          res.status(404).json({
            success: false,
            error: "Player not found",
            details: {
              code: "player-not-found",
              message: "The specified player does not exist",
              playerId: result.error.playerId,
            },
          });
        } else if (result.error.status === "player-not-in-game") {
          res.status(400).json({
            success: false,
            error: "Player is not in this game",
            details: {
              code: "player-not-in-game",
              message: "The specified player does not belong to this game",
              playerId: result.error.playerId,
              gameId: result.error.gameId,
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
