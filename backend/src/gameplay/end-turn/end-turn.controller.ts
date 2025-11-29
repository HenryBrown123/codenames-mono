/**
 * End Turn Controller
 * API endpoint for codebreakers to end their turn
 */

import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { EndTurnService } from "./end-turn.service";
import type { AppLogger } from "@backend/common/logging";

export const createEndTurnController = (logger: AppLogger) => (endTurnService: EndTurnService) => {
  return async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const log = logger.for({}).withMeta({ endpoint: "POST /games/:gameId/rounds/:roundNumber/end-turn" }).create();
    const { gameId, roundNumber } = req.params;
    const { playerId } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      log.warn("Request unauthorized: no userId");
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    if (!playerId) {
      log.warn("Request validation failed: playerId required");
      res.status(400).json({
        success: false,
        error: "playerId is required",
      });
      return;
    }

    log.info(`Request: ${JSON.stringify({ gameId, roundNumber, userId, playerId })}`);

    const result = await endTurnService({
      gameId,
      roundNumber: parseInt(roundNumber, 10),
      userId,
      playerId,
    });

    if (!result.success) {
      log.warn(`Response: ${result.error}`);
      res.status(400).json(result);
      return;
    }

    log.info("Response: 200 OK");
    res.status(200).json(result);
  };
};
