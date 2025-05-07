import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

import * as gameRepository from "@backend/common/data-access/games.repository";
import * as roundsRepository from "@backend/common/data-access/rounds.repository";

import newRound from "@backend/features/gameplay/new-round";

import { gameplayStateProvider } from "./state/gameplay-state.provider";
import { gameplayErrorHandler } from "./errors/gameplay-errors.middleware";

/**
 * Initializes the gameplay feature module with all routes and dependencies
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  // Initialize repository function
  const getGameById = gameRepository.getGameDataByPublicId(db);
  const getRounds = roundsRepository.getRoundsByGameId(db);
  const createRound = roundsRepository.createNewRound(db);

  // Initialize shared gameplay services
  const getGameState = gameplayStateProvider(getGameById, getRounds);

  const { controller: newRoundController } = newRound({
    getGameState: getGameState,
    createRound: createRound,
  });

  const router = Router();

  router.post("/games/:gameId/rounds", auth, newRoundController);

  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);
};
