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
  const { provider: getGameState } = gameplayState(db);
  const { provider: getTurnState } = turnState(db);

  // Gameplay actions
  const { handler: gameplayHandler } = gameplayActions(db);

  // Feature modules - each gets both read and write capabilities

  const { controller: getGameController } = getGame(logger)({
    getGameState,
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
  });

  const { controller: makeGuessController, service: makeGuessService } = makeGuess(logger)({
    getGameState,
    gameplayHandler,
    getTurnState,
  });

  const { controller: getTurnController } = getTurn(logger)({
    getTurnState,
  });

  const { controller: endTurnController, service: endTurnService } = endTurn(logger)({
    getGameState,
    gameplayHandler,
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

  // Turn routes
  router.get("/turns/:turnId", auth, getTurnController);

  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);

  // Return services for AI integration
  return {
    giveClueService,
    makeGuessService,
    endTurnService,
    getGameState,
  };
};
