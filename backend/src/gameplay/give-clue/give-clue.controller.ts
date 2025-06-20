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
 * Updated response schema with complete turn data
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

      // Call give clue service
      const result = await giveClue({
        gameId: params.gameId,
        roundNumber: params.roundNumber,
        userId: auth.userId,
        word: body.word,
        targetCardCount: body.targetCardCount,
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
              error: "You are not a player in this game",
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
              error: "Invalid game state for giving clue",
              details: {
                code: result.error.status,
                validationErrors: result.error.validationErrors,
              },
            });
            return;

          case "invalid-clue-word":
            res.status(400).json({
              success: false,
              error: "Invalid clue word",
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
          clue: result.data.clue,
          turn: result.data.turn, // ← Now includes complete turn data
        },
      });
    } catch (error) {
      console.error("Error in giveClue controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: { code: "internal-error" },
      });
    }
  };
};
