import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import { z } from "zod";
import { GetTurnService, ApiTurnData } from "./get-turn.service";

/**
 * Request validation schema
 */
const getTurnRequestSchema = z.object({
  params: z.object({
    publicId: z.string().uuid("Turn ID must be a valid UUID"),
  }),
  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
    gameId: z.number().int().positive("Game ID must be a positive integer"),
  }),
});

type ValidatedGetTurnRequest = z.infer<typeof getTurnRequestSchema>;

/**
 * API response type
 */
interface GetTurnResponse {
  success: true;
  data: {
    turn: ApiTurnData;
  };
}

/**
 * Controller for GET /api/turns/:publicId
 */
export const controller =
  (getTurnService: GetTurnService) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const validationResult = getTurnRequestSchema.safeParse({
        params: req.params,
        auth: req.auth, // gameId and userId from auth middleware
      });

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "Invalid request parameters",
          details: validationResult.error.errors,
        });
        return;
      }

      const { params, auth }: ValidatedGetTurnRequest = validationResult.data;

      // Get sanitized turn data
      const turnData = await getTurnService(
        params.publicId,
        auth.gameId,
        auth.userId,
      );

      if (!turnData) {
        res.status(404).json({
          success: false,
          error: "Turn not found",
        });
        return;
      }

      // Response with compile-time type safety
      const response: GetTurnResponse = {
        success: true,
        data: {
          turn: turnData,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "UnauthorizedTurnAccessError"
      ) {
        res.status(403).json({
          success: false,
          error: "Access denied to this turn",
        });
        return;
      }

      console.error("Error in getTurn controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };
