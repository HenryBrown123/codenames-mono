import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import { RoundCreationService } from "./new-round.service";
import { z } from "zod";

/**
 * Request validation schema for new round creation
 */
export const newRoundRequestSchema = z.object({
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
export type ValidatedNewRoundRequest = z.infer<typeof newRoundRequestSchema>;

/**
 * Response schema for new round creation
 */
export const newRoundResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    round: z.object({
      id: z.number(),
      roundNumber: z.number(),
      gameId: z.number(),
      createdAt: z.date(),
    }),
  }),
});

/**
 * Type definition for error response
 */
export type NewRoundErrorResponse = {
  success: false;
  error: string;
  details?: {
    code: string;
    validationErrors?: { path: string; message: string }[];
  };
};

/**
 * Type definition for new round response
 */
export type NewRoundResponse = z.infer<typeof newRoundResponseSchema>;

/**
 * Dependencies required by the new round controller
 */
export type Dependencies = {
  createRound: RoundCreationService;
};

/**
 * Creates a controller for handling new round creation
 */
export const newRoundController = ({ createRound }: Dependencies) => {
  /**
   * Handles HTTP request to create a new round in a game
   * @param req - Express request with game ID
   * @param res - Express response object
   * @param next - Express error handling function
   */
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Validate the request
      const validatedRequest = newRoundRequestSchema.parse({
        params: req.params,
        auth: req.auth,
      });

      // Call the service to create a new round
      const result = await createRound({
        gameId: validatedRequest.params.gameId,
        userId: validatedRequest.auth.userId,
      });

      if (result.success) {
        // Format successful response
        const response: NewRoundResponse = {
          success: true,
          data: {
            round: {
              id: result.data.roundId,
              roundNumber: result.data.roundNumber,
              gameId: result.data.gameId,
              createdAt: result.data.createdAt,
            },
          },
        };

        res.status(201).json(response);
      } else {
        const errorResponse: NewRoundErrorResponse = {
          success: false,
          error: "Failed to create new round",
          details: {
            code: result.error.status,
          },
        };

        if (
          result.error.status === "invalid-game-state" &&
          result.error.validationErrors
        ) {
          errorResponse.details!.validationErrors =
            result.error.validationErrors;
        }

        const statusCode =
          result.error.status === "game-not-found"
            ? 404
            : result.error.status === "invalid-game-state"
              ? 409
              : 500;

        res.status(statusCode).json(errorResponse);
      }
    } catch (error) {
      next(error);
    }
  };
};
