import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { MakeGuessService } from "./make-guess.service";
import { z } from "zod";

/**
 * Request validation schema for making guesses
 */
export const makeGuessRequestSchema = z.object({
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
    cardWord: z
      .string()
      .min(1, "Card word is required")
      .max(50, "Card word too long"),
  }),
});

/**
 * Type definition for validated request
 */
export type ValidatedMakeGuessRequest = z.infer<typeof makeGuessRequestSchema>;

/**
 * Response schema for making guesses
 */
export const makeGuessResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    guess: z.object({
      cardWord: z.string(),
      outcome: z.string(),
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
export type MakeGuessErrorResponse = {
  success: false;
  error: string;
  details?: {
    code: string;
    validationErrors?: { path: string; message: string }[];
  };
};

/**
 * Type definition for make guess response
 */
export type MakeGuessResponse = z.infer<typeof makeGuessResponseSchema>;

/**
 * Dependencies required by the make guess controller
 */
export type Dependencies = {
  makeGuess: MakeGuessService;
};

/**
 * Creates a controller for handling guess making
 */
export const makeGuessController = ({ makeGuess }: Dependencies) => {
  /**
   * Handles HTTP request to make a guess in a game
   */
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = makeGuessRequestSchema.safeParse({
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

      const result = await makeGuess({
        gameId: params.gameId,
        roundNumber: params.roundNumber,
        userId: auth.userId,
        cardWord: body.cardWord,
      });

      if (!result.success) {
        const errorResponse: MakeGuessErrorResponse = {
          success: false,
          error: "Failed to make guess",
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

        if (result.error.status === "invalid-card") {
          errorResponse.error = result.error.reason;
          errorResponse.details!.code = "invalid-card";
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

        if (result.error.status === "invalid-card") {
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
          guess: {
            cardWord: result.data.guess.cardWord,
            outcome: result.data.guess.outcome,
            createdAt: result.data.guess.createdAt,
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
