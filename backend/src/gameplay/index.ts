import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

import { gameplayState } from "./state";
import { gameplayActions } from "./gameplay-actions";
import { turnState } from "./state";

import getGame from "./get-game";
import getPlayers from "./get-players";
import giveClue from "./give-clue";
import makeGuess from "./make-guess";
import getTurn from "./get-turn";

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
  const { provider: getGameState, playerSpecificProvider: getPlayerSpecificGameState } = gameplayState(db);
  const { provider: getTurnState } = turnState(db);

  // Gameplay actions
  const { handler: gameplayHandler } = gameplayActions(db);

  // Feature modules - each gets both read and write capabilities

  const { controller: getGameController } = getGame({
    getPlayerSpecificGameState,
  });

  const { controller: getPlayersController } = getPlayers({
    getGameState,
  });

  const { controller: giveClueController } = giveClue({
    getPlayerSpecificGameState,
    gameplayHandler,
    getTurnState, // ← Pass turn state provider to give clue
  });

  const { controller: makeGuessController } = makeGuess({
    getPlayerSpecificGameState,
    gameplayHandler,
    getTurnState, // ← Pass turn state provider to make guess
  });

  const { controller: getTurnController } = getTurn({
    getTurnState,
  });

  // Routes setup
  const router = Router();

  router.get("/games/:gameId", auth, getGameController);
  router.get("/games/:gameId/players", auth, getPlayersController);
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

  // Turn routes
  router.get("/turns/:turnId", auth, getTurnController);

  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);
};
