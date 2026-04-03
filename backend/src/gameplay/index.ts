import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";
import type { HttpLoggerHandler } from "@backend/common/http-middleware/http-logger.middleware";
import type { AppLogger } from "@backend/common/logging";

import { gameplayState } from "@backend/common/state";
import { gameplayActions } from "./gameplay-actions";
import { turnState } from "@backend/common/state";

import getGame from "./get-game";
import getPlayers from "./get-players";
import getEvents from "./get-events";
import giveClue from "./give-clue";
import makeGuess from "./make-guess";
import getTurn from "./get-turn";
import endTurn from "./end-turn";
import startTurn from "./start-turn";

import { gameplayErrorHandler } from "./errors/gameplay-errors.middleware";

/**
 * Initializes the gameplay feature module with all routes and dependencies
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
  httpLogger: HttpLoggerHandler,
  appLogger: AppLogger,
) => {
  const logger = appLogger.for({ feature: "gameplay" }).create();
  // State "providers"
  const { provider: getGameState, loader: loadGameData } = gameplayState(db);
  const { provider: getTurnState, getTurnsByRoundId, findPlayersByRoundId } = turnState(db);

  // Gameplay actions
  const { handler: gameplayHandler } = gameplayActions(db);

  // Feature modules - each gets both read and write capabilities

  const { controller: getGameController } = getGame(logger)({
    getGameState,
    loadGameData,
  });

  const { controller: getPlayersController } = getPlayers(logger)({
    getGameState,
  });

  const { controller: getEventsController } = getEvents(logger)({
    getGameState,
    db,
  });

  const { controller: giveClueController, service: giveClueService } = giveClue(logger)({
    getGameState,
    gameplayHandler,
    getTurnState,
    loadGameData,
  });

  const { controller: makeGuessController, service: makeGuessService } = makeGuess(logger)({
    getGameState,
    gameplayHandler,
    getTurnState,
    loadGameData,
  });

  const { controller: getTurnController } = getTurn(logger)({
    getTurnState,
    getTurnsByRoundId,
    findPlayersByRoundId,
  });

  const { controller: endTurnController, service: endTurnService } = endTurn(logger)({
    getGameState,
    gameplayHandler,
    loadGameData,
  });

  const { controller: startTurnController, service: startTurnService } = startTurn(logger)({
    getGameState,
    gameplayHandler,
    loadGameData,
  });

  // Routes setup
  const router = Router();

  // HTTP request/response logging
  router.use(httpLogger(logger));

  router.get("/games/:gameId", auth, getGameController);
  router.get("/games/:gameId/players", auth, getPlayersController);
  router.get("/games/:gameId/events", auth, getEventsController);
  router.post("/games/:gameId/rounds/:roundNumber/clues", auth, giveClueController);

  router.post("/games/:gameId/rounds/:roundNumber/guesses", auth, makeGuessController);

  router.post("/games/:gameId/rounds/:roundNumber/end-turn", auth, endTurnController);
  router.post("/games/:gameId/rounds/:roundNumber/turns", auth, startTurnController);

  // Turn routes
  router.get("/turns/:turnId", auth, getTurnController);

  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);

  // Return services for AI integration
  return {
    giveClueService,
    makeGuessService,
    endTurnService,
    startTurnService,
    getGameState,
    loadGameData,
  };
};
