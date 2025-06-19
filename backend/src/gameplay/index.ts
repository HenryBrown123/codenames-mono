import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

import { gameplayState } from "./state";
import { gameplayActions } from "./gameplay-actions";
import { turnState } from "./state";

import newRound from "./new-round";
import dealCards from "./deal-cards";
import startRound from "./start-round";
import getGame from "./get-game";
import giveClue from "./give-clue";
import makeGuess from "./guess";
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
  const { provider: getGameState } = gameplayState(db);
  const { provider: getTurnState } = turnState(db);

  // Gameplay actions
  const { handler: gameplayHandler } = gameplayActions(db);

  // Feature modules - each gets both read and write capabilities
  const { controller: newRoundController } = newRound({
    getGameState,
    gameplayHandler,
  });

  const { controller: dealCardsController } = dealCards({
    getGameState,
    gameplayHandler,
  });

  const { controller: startRoundController } = startRound({
    getGameState,
    gameplayHandler,
  });

  const { controller: getGameController } = getGame({
    getGameState,
  });

  const { controller: giveClueController } = giveClue({
    getGameState,
    gameplayHandler,
  });

  const { controller: makeGuessController } = makeGuess({
    getGameState,
    gameplayHandler,
  });

  const { controller: getTurnController } = getTurn({
    getTurnState,
  });

  // Routes setup
  const router = Router();

  router.post("/games/:gameId/rounds", auth, newRoundController);
  router.post("/games/:gameId/rounds/:id/deal", auth, dealCardsController);
  router.post(
    "/games/:gameId/rounds/:roundNumber/start",
    auth,
    startRoundController,
  );
  router.get("/games/:gameId", auth, getGameController);
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
  router.get("/turns/:publicId", auth, getTurnController);

  app.use("/api", router);
  app.use("/api", gameplayErrorHandler);
};
