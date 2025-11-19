import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

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
) => {
  // State "providers"
  const { provider: getGameState } = gameplayState(db);
  const { provider: getTurnState } = turnState(db);

  // Gameplay actions
  const { handler: gameplayHandler } = gameplayActions(db);

  // Feature modules - each gets both read and write capabilities

  const { controller: getGameController } = getGame({
    getGameState,
  });

  const { controller: getPlayersController } = getPlayers({
    getGameState,
  });

  const { controller: getEventsController } = getEvents({
    getGameState,
    db,
  });

  const { controller: giveClueController, service: giveClueService } = giveClue({
    getGameState,
    gameplayHandler,
    getTurnState, // ← Pass turn state provider to give clue
  });

  const { controller: makeGuessController, service: makeGuessService } = makeGuess({
    getGameState,
    gameplayHandler,
    getTurnState, // ← Pass turn state provider to make guess
  });

  const { controller: getTurnController } = getTurn({
    getTurnState,
  });

  const { controller: endTurnController, service: endTurnService } = endTurn({
    getGameState,
    gameplayHandler,
  });

  // Routes setup
  const router = Router();

  router.get("/games/:gameId", auth, getGameController);
  router.get("/games/:gameId/players", auth, getPlayersController);
  router.get("/games/:gameId/events", auth, getEventsController);
  router.post(
    "/games/:gameId/rounds/:roundNumber/clues",
    auth,
    giveClueController,
  );

  router.post(
    "/games/:gameId/rounds/:roundNumber/guesses",
    auth,
    makeGuessController,
  );

  router.post(
    "/games/:gameId/rounds/:roundNumber/end-turn",
    auth,
    endTurnController,
  );

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
