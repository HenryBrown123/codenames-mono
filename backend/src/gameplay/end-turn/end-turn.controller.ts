/**
 * End Turn Controller
 * API endpoint for codebreakers to end their turn
 */

import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { EndTurnService } from "./end-turn.service";

export const createEndTurnController = (endTurnService: EndTurnService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { gameId, roundNumber } = req.params;
    const { playerId } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    if (!playerId) {
      res.status(400).json({
        success: false,
        error: "playerId is required",
      });
      return;
    }

    const result = await endTurnService({
      gameId,
      roundNumber: parseInt(roundNumber, 10),
      userId,
      playerId,
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  };
};
