import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";

import { quickStartService } from "./quick-start.service";
import {
  quickStartRequestSchema,
  quickStartResponseSchema,
} from "./quick-start.validation";

/** Dependencies required by the quick start controller */
export type Dependencies = {
  quickStart: ReturnType<typeof quickStartService>;
};

/** Creates a controller for quick starting a game */
export const quickStartController =
  ({ quickStart }: Dependencies) =>
  /**
   * Handles HTTP request to quick start a game
   * @param req - Express request with game ID
   * @param res - Express response object
   * @param next - Express error handling function
   */
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedRequest = quickStartRequestSchema.parse({
        params: req.params,
        auth: req.auth,
      });

      const gameId = validatedRequest.params.gameId;
      const userId = validatedRequest.auth.userId;
      const result = await quickStart(gameId, userId);

      if (result.success) {
        const response = {
          success: true,
          data: {
            game: {
              publicId: result.publicId,
              status: result.status,
            },
            round: {
              roundId: result.roundId,
              roundNumber: 1, // First round for quick start
            },
            turn: {
              turnId: result.turnId,
            },
          },
        };

        const validatedResponse = quickStartResponseSchema.parse(response);
        res.status(200).json(validatedResponse);
      } else {
        // All errors from service are treated as 409 Conflict
        res.status(409).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      next(error);
    }
  };