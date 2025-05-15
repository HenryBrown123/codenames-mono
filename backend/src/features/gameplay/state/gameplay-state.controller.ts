import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import { GetGameStateResult } from "./gameplay-state.service";
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
  getGameState: (input: {
    gameId: string;
    userId: number;
  }) => Promise<GetGameStateResult>;
};

/**
 * Creates a controller for retrieving game state
 *
 * @param dependencies - Services required by the controller
 * @returns Express request handler function
 */
export const getGameStateController =
  ({ getGameState }: Dependencies) =>
  /**
   * Handles HTTP request to retrieve game state
   * @param req - Express request with game ID
   * @param res - Express response object
   * @param next - Express error handling function
   */
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate the request
      const validatedRequest = gameStateRequestSchema.parse({
        params: req.params,
        auth: req.auth,
      });

      // Call the service to get game state
      const result = await getGameState({
        gameId: validatedRequest.params.gameId,
        userId: validatedRequest.auth.userId,
      });

      if (result.success) {
        // Return successful response with game state
        res.status(200).json({
          success: true,
          data: {
            game: result.data,
          },
        });
      } else {
        // Handle different error cases
        if (result.error.status === "game-not-found") {
          res.status(404).json({
            success: false,
            error: "Game not found",
            details: { gameId: result.error.gameId },
          });
        } else if (result.error.status === "unauthorized") {
          res.status(403).json({
            success: false,
            error: "You are not authorized to view this game",
            details: { userId: result.error.userId },
          });
        } else {
          // Fallback error response
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
