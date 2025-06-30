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
    playerId: z.string().min(1, "Player ID is required"),
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
 * Updated response schema with complete turn data
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
      id: z.string(),
      teamName: z.string(),
      status: z.enum(["ACTIVE", "COMPLETED"]),
      guessesRemaining: z.number(),
      createdAt: z.date(),
      completedAt: z.date().nullable().optional(),
      clue: z
        .object({
          word: z.string(),
          number: z.number(),
          createdAt: z.date(),
        })
        .optional(),
      hasGuesses: z.boolean(),
      lastGuess: z
        .object({
          cardWord: z.string(),
          playerName: z.string(),
          outcome: z.string().nullable(),
          createdAt: z.date(),
        })
        .optional(),
      prevGuesses: z.array(
        z.object({
          cardWord: z.string(),
          playerName: z.string(),
          outcome: z.string().nullable(),
          createdAt: z.date(),
        }),
      ),
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

      // Call make guess service
      const result = await makeGuess({
        gameId: params.gameId,
        roundNumber: params.roundNumber,
        userId: auth.userId,
        playerId: body.playerId,
        cardWord: body.cardWord,
      });

      if (!result.success) {
        // Handle specific error types with appropriate HTTP status codes
        switch (result.error.status) {
          case "game-not-found":
            res.status(404).json({
              success: false,
              error: "Game not found",
              details: { code: result.error.status },
            });
            return;

          case "user-not-player":
            res.status(403).json({
              success: false,
              error: "You are not authorized to act as this player",
              details: { code: result.error.status },
            });
            return;

          case "player-not-found":
            res.status(404).json({
              success: false,
              error: "Player not found",
              details: { code: result.error.status },
            });
            return;

          case "player-not-in-game":
            res.status(400).json({
              success: false,
              error: "Player is not in this game",
              details: { code: result.error.status },
            });
            return;

          case "round-not-found":
            res.status(404).json({
              success: false,
              error: "Round not found",
              details: { code: result.error.status },
            });
            return;

          case "round-not-current":
            res.status(409).json({
              success: false,
              error: "Round is not current",
              details: { code: result.error.status },
            });
            return;

          case "invalid-game-state":
            res.status(409).json({
              success: false,
              error: "Invalid game state for making guess",
              details: {
                code: result.error.status,
                validationErrors: result.error.validationErrors,
              },
            });
            return;

          case "invalid-card":
            res.status(400).json({
              success: false,
              error: "Invalid card selection",
              details: { code: result.error.status },
            });
            return;

          default:
            res.status(500).json({
              success: false,
              error: "Unknown error occurred",
              details: { code: "unknown-error" },
            });
            return;
        }
      }

      // Success response with complete turn data
      res.status(200).json({
        success: true,
        data: {
          guess: result.data.guess,
          turn: result.data.turn, // ← Now includes complete turn data
        },
      });
    } catch (error) {
      console.error("Error in makeGuess controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: { code: "internal-error" },
      });
    }
  };
};
