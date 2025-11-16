/**
 * Controller for creating AI bot players
 */

import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import { createAIBotService } from "./create-ai-bot.service";
import type { Kysely } from "kysely";
import type { DB } from "@backend/common/db/db.types";

export type Dependencies = {
  db: Kysely<DB>;
};

export const createAIBotController =
  ({ db }: Dependencies) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { botName, teamName } = req.body;

      if (!botName || typeof botName !== "string") {
        res.status(400).json({
          success: false,
          error: "botName is required and must be a string",
        });
        return;
      }

      if (!teamName || (teamName !== "RED" && teamName !== "BLUE")) {
        res.status(400).json({
          success: false,
          error: "teamName must be RED or BLUE",
        });
        return;
      }

      const service = createAIBotService(db);
      const result = await service({ gameId, botName, teamName });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
