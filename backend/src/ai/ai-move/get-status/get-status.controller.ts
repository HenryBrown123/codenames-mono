import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { getStatusService } from "./get-status.service";
import { z } from "zod";

/**
 * Request validation schema
 */
const getStatusParamsSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
});

/**
 * Dependencies required by the controller
 */
export interface GetStatusControllerDeps {
  getStatus: ReturnType<typeof getStatusService>;
}

/**
 * Creates the get status controller
 */
export const getStatusController = (deps: GetStatusControllerDeps) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId } = getStatusParamsSchema.parse(req.params);
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const result = await deps.getStatus(gameId, userId);

      if (result.status === "game-not-found") {
        res.status(404).json({
          success: false,
          error: "Game not found or you are not a player in this game",
        });
        return;
      }

      if (result.status === "unauthorized") {
        res.status(403).json({
          success: false,
          error: "You do not have access to this game",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.aiStatus,
      });
    } catch (error) {
      next(error);
    }
  };
