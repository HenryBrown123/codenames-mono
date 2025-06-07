import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { GiveClueService } from "./give-clue.service";
import { z } from "zod";

/**
 * Request validation schema for giving clues
 */
export const giveClueRequestSchema = z.object({
  params: z.object({
    gameId: z.string().min(1, "Game ID is required"),
    roundNumber: z
      .string()
      .transform(Number)
      .refine((n) => n > 0, "Round number must be positive"),
  }),
  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
  body: z.object({
    word: z
      .string()
      .min(1, "Clue word is required")
      .max(50, "Clue word too long"),
    targetCardCount: z
      .number()
      .int()
      .min(1, "Target card count must be at least 1")
      .max(25, "Target card count cannot exceed 25"),
  }),
});

/**
 * Type definition for validated request
 */
export type ValidatedGiveClueRequest = z.infer<typeof giveClueRequestSchema>;

/**
 * Response schema for giving clues
 */
export const giveClueResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    clue: z.object({
      word: z.string(),
      targetCardCount: z.number(),
      createdAt: z.date(),
    }),
    turn: z.object({
      teamName: z.string(),
      guessesRemaining: z.number(),
      status: z.string(),
    }),
  }),
});

/**
 * Type definition for error response
 */
export type GiveClueErrorResponse = {
  success: false;
  error: string;
  details?: {
    code: string;
    validationErrors?: { path: string; message: string }[];
  };
};

/**
 * Type definition for give clue response
 */
export type GiveClueResponse = z.infer<typeof giveClueResponseSchema>;

/**
 * Dependencies required by the give clue controller
 */
export type Dependencies = {
  giveClue: GiveClueService;
};

/**
 * Creates a controller for handling clue giving
 */
export const giveClueController = ({ giveClue }: Dependencies) => {
  /**
   * Handles HTTP request to give a clue in a game
   * @param req - Express request with game ID, round number and clue details
   * @param res - Express response object
   * @param next - Express error handling function
   */
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = giveClueRequestSchema.safeParse({
        params: req.params,
        auth: req.auth,
        body: req.body,
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

      const { params, auth, body } = validationResult.data;

      const result = await giveClue({
        gameId: params.gameId,
        roundNumber: params.roundNumber,
        userId: auth.userId,
        word: body.word,
        targetCardCount: body.targetCardCount,
      });

      if (!result.success) {
        const errorResponse: GiveClueErrorResponse = {
          success: false,
          error: "Failed to give clue",
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

        if (result.error.status === "invalid-clue-word") {
          errorResponse.error = result.error.reason;
          errorResponse.details!.code = "invalid-clue-word";
        }

        if (result.error.status === "round-not-current") {
          errorResponse.error = `Round ${result.error.requestedRound} is not the current round (current: ${result.error.currentRound})`;
          errorResponse.details!.code = "round-not-current";
        }

        if (result.error.status === "game-not-found") {
          res.status(404).json(errorResponse);
          return;
        }

        if (
          result.error.status === "round-not-found" ||
          result.error.status === "round-not-current"
        ) {
          res.status(404).json(errorResponse);
          return;
        }

        if (result.error.status === "invalid-clue-word") {
          res.status(400).json(errorResponse);
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
          clue: {
            word: result.data.clue.word,
            targetCardCount: result.data.clue.targetCardCount,
            createdAt: result.data.clue.createdAt,
          },
          turn: {
            teamName: result.data.turn.teamName,
            guessesRemaining: result.data.turn.guessesRemaining,
            status: result.data.turn.status,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
};
