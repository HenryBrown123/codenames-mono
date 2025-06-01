import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { RoundCreationService } from "./new-round.service";
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
 * Response schema for new round creation
 */
export const newRoundResponseSchema = z.object({
  success: z.literal(true),
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
 * Error response schema for new round creation failures
 */
export const newRoundErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z
    .object({
      code: z.string(),
      validationErrors: z
        .array(
          z.object({
            path: z.string(),
            message: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
});

/**
 * Type definitions
 */
export type ValidatedNewRoundRequest = z.infer<typeof newRoundRequestSchema>;
export type NewRoundResponse = z.infer<typeof newRoundResponseSchema>;
export type NewRoundErrorResponse = z.infer<typeof newRoundErrorSchema>;

/**
 * Dependencies required by the new round controller
 */
export type Dependencies = {
  createRound: RoundCreationService;
};

/**
 * Creates a controller for handling new round creation
 *
 * @param dependencies - Service dependencies
 * @returns Express request handler
 */
export const newRoundController = ({ createRound }: Dependencies) => {
  /**
   * Handles HTTP request to create a new round in a game
   *
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
      const validationResult = newRoundRequestSchema.safeParse({
        params: req.params,
        auth: req.auth,
      });

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request parameters",
          details: {
            code: "validation-error",
            validationErrors: validationResult.error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
        });
        return;
      }

      const { params, auth } = validationResult.data;

      const result = await createRound({
        gameId: params.gameId,
        userId: auth.userId,
      });

      if (!result.success) {
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

        if (result.error.status === "game-not-found") {
          res.status(404).json(errorResponse);
          return;
        }

        if (result.error.status === "invalid-game-state") {
          res.status(409).json(errorResponse);
          return;
        }

        res.status(500).json(errorResponse);
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          round: {
            id: result.data._roundId,
            roundNumber: result.data.roundNumber,
            gameId: result.data._gameId,
            createdAt: result.data.createdAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
};
