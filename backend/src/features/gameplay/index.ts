// backend/src/features/gameplay/index.ts
import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

import * as gameRepository from "@backend/common/data-access/games.repository";
import * as roundsRepository from "@backend/common/data-access/rounds.repository";
import * as playerRepository from "@backend/common/data-access/players.repository";
import * as teamsRepository from "@backend/common/data-access/teams.repository";
import * as cardsRepository from "@backend/common/data-access/cards.repository";
import * as turnsRepository from "@backend/common/data-access/turns.repository";

import newRound from "@backend/features/gameplay/new-round";
import dealCards from "@backend/features/gameplay/deal-cards";
import startRound from "@backend/features/gameplay/start-round";

import { createGameplayActions } from "./actions/";
import { gameplayStateProvider } from "./state/gameplay-state.provider";
import { gameplayErrorHandler } from "./errors/gameplay-errors.middleware";
import { getGameStateService } from "./state/gameplay-state.service";
import { getGameStateController } from "./state/gameplay-state.controller";

/**
 * Initializes the gameplay feature module
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  // Query repositories
  const getGameById = gameRepository.findGameByPublicId(db);
  const getRounds = roundsRepository.getRoundsByGameId(db);
  const getLatestRound = roundsRepository.getLatestRound(db);
  const getPlayers = playerRepository.findPlayersByGameId(db);
  const getPlayerContext = playerRepository.getPlayerContext(db);
  const getTeams = teamsRepository.getTeamsByGameId(db);
  const getCardsByRound = cardsRepository.getCardsByRoundId(db);
  const getTurnsByRound = turnsRepository.getTurnsByRoundId(db);

  const getGameplayState = gameplayStateProvider(
    getGameById,
    getTeams,
    getCardsByRound,
    getTurnsByRound,
    getPlayers,
    getLatestRound,
    getRounds,
    getPlayerContext,
  );

  // Command actions with transaction support
  const createActionsForRole = createGameplayActions(db);

  // Services
  const gameStateService = getGameStateService({
    getGameState: getGameplayState,
  });

  // Controllers
  const gameStateController = getGameStateController({
    getGameState: gameStateService,
  });

  const { controller: newRoundController } = newRound({
    getGameState: getGameplayState,
    createActionsForRole,
  });

  const { controller: dealCardsController } = dealCards({
    getGameState: getGameplayState,
    createActionsForRole,
  });

  const { controller: startRoundController } = startRound({
    getGameState: getGameplayState,
    createActionsForRole,
  });

  // Routes
  const router = Router();

  router.post("/games/:gameId/rounds", auth, newRoundController);
  router.post("/games/:gameId/rounds/:id/deal", auth, dealCardsController);
  router.post("/games/:gameId/rounds/:id/start", auth, startRoundController);
  router.get("/games/:gameId", auth, gameStateController);

  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);
};
