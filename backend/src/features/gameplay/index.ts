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

import { gameplayStateProvider } from "./state/gameplay-state.provider";
import { gameplayErrorHandler } from "./errors/gameplay-errors.middleware";
import { getGameStateService } from "./state/gameplay-state.service";
import { getGameStateController } from "./state/gameplay-state.controller";

/**
 * Initializes the gameplay feature module with all routes and dependencies
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  /** Initialize repository functions */
  const getGameById = gameRepository.findGameByPublicId(db);

  const getRounds = roundsRepository.getRoundsByGameId(db);
  const getLatestRound = roundsRepository.getLatestRound(db);
  const createRound = roundsRepository.createNewRound(db);
  const updateRoundStatus = roundsRepository.updateRoundStatus(db);
  const getPlayers = playerRepository.findPlayersByGameId(db);
  const getPlayerContext = playerRepository.getPlayerContext(db);
  const getTeams = teamsRepository.getTeamsByGameId(db);
  const getCardsByRound = cardsRepository.getCardsByRoundId(db);
  const getRandomWords = cardsRepository.getRandomWords(db);
  const createCards = cardsRepository.createCards(db);
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

  /** Initialize services */
  const gameStateService = getGameStateService({
    getGameState: getGameplayState,
  });

  /** Initialize controllers */
  const gameStateController = getGameStateController({
    getGameState: gameStateService,
  });

  const { controller: newRoundController } = newRound({
    getGameState: getGameplayState,
    createRound: createRound,
  });

  const { controller: dealCardsController } = dealCards({
    getGameState: getGameplayState,
    getRandomWords: getRandomWords,
    createCards: createCards,
  });

  const { controller: startRoundController } = startRound({
    getGameState: getGameplayState,
    updateRoundStatus: updateRoundStatus,
  });

  /** Setup routes */
  const router = Router();

  router.post("/games/:gameId/rounds", auth, newRoundController);

  // Gameplay action endpoints
  router.post("/games/:gameId/rounds/:id/deal", auth, dealCardsController);
  router.post("/games/:gameId/rounds/:id/start", auth, startRoundController);

  // Game state endpoint
  router.get("/games/:gameId", auth, gameStateController);

  // Apply routes and error handlers
  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);
};
