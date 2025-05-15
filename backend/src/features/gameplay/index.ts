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
  const getPlayers = playerRepository.findPlayersByGameId(db);
  const getTeams = teamsRepository.getTeamsByGameId(db);
  const getRandomWords = cardsRepository.getRandomWords(db);
  const getCardsByRound = cardsRepository.getCardsByRoundId(db);
  const getTurnsByRound = turnsRepository.getTurnsByRoundId(db);
  const getLatestRound = roundsRepository.getLatestRound(db);
  const getPlayerContext = playerRepository.getPlayerContext(db);

  const createCards = cardsRepository.createCards(db);
  const createRound = roundsRepository.createNewRound(db);

  /** Setup shared game state provider */
  const getGameState = gameplayStateProvider(
    getGameById,
    getTeams,
    getCardsByRound,
    getTurnsByRound,
    getPlayers,
    getLatestRound,
    getPlayerContext,
  );

  /** Initialize services */
  const gameStateService = getGameStateService({
    getGameState,
  });

  /** Initialize controllers */
  const { controller: newRoundController } = newRound({
    getGameState: getGameState,
    createRound: createRound,
  });

  const { controller: dealCardsController } = dealCards({
    getGameState: getGameState,
    getRandomWords: getRandomWords,
    createCards: createCards,
  });

  const gameStateController = getGameStateController({
    getGameState: gameStateService,
  });

  /** Setup routes */
  const router = Router();

  // Gameplay actions
  router.post("/games/:gameId/rounds", auth, newRoundController);
  router.post("/games/:gameId/rounds/:id/deal", auth, dealCardsController);

  // Game state endpoint
  router.get("/games/:gameId", auth, gameStateController);

  // Apply routes and error handlers
  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);
};
