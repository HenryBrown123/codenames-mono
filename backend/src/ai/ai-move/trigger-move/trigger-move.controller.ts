import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { triggerMoveService } from "./trigger-move.service";
import { z } from "zod";

/**
 * Request validation schema
 */
const triggerMoveParamsSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
});

/**
 * Dependencies required by the controller
 */
export interface TriggerMoveControllerDeps {
  triggerMove: ReturnType<typeof triggerMoveService>;
}

/**
 * Creates the trigger move controller
 */
export const triggerMoveController = (deps: TriggerMoveControllerDeps) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId } = triggerMoveParamsSchema.parse(req.params);
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const result = await deps.triggerMove(gameId, userId);

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

      if (result.status === "not-ai-turn") {
        res.status(409).json({
          success: false,
          error: "It is not currently the AI's turn",
        });
        return;
      }

      if (result.status === "already-running") {
        res.status(409).json({
          success: false,
          error: "AI is already thinking",
        });
        return;
      }

      // Return 202 Accepted since the AI move is executing asynchronously
      res.status(202).json({
        success: true,
        data: result.run,
      });
    } catch (error) {
      next(error);
    }
  };
