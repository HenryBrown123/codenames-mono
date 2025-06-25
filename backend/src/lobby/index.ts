import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

import { createTransactionalHandler } from "@backend/common/data-access/transaction-handler";

// Import feature components
import { addPlayersService } from "./add-players/add-players.service";
import { addPlayersController } from "./add-players/add-players.controller";

import { modifyPlayersService } from "./modify-players/modify-players.service";
import { modifyPlayersController } from "./modify-players/modify-players.controller";

import { removePlayersService } from "./remove-players/remove-players.service";
import { removePlayersController } from "./remove-players/remove-players.controller";

import { startGameService } from "./start-game/start-game.service";
import { startGameController } from "./start-game/start-game.controller";

import newRound from "./new-round";
import dealCards from "./deal-cards";
import startRound from "./start-round";
import quickStart from "./quick-start";

import { lobbyState } from "./state";
import { lobbyOperations } from "./lobby-actions";
import { lobbyErrorHandler } from "./errors/lobby-errors.middleware";

/** Initializes the lobby feature module with all routes and dependencies */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  // State providers
  const { provider: getLobbyState } = lobbyState(db);

  // Transaction handlers
  const lobbyHandler = createTransactionalHandler(db, lobbyOperations);

  // Create service functions
  const lobbyAddPlayersService = addPlayersService({
    lobbyHandler,
    getLobbyState,
  });

  const lobbyModifyPlayersService = modifyPlayersService({
    lobbyHandler,
    getLobbyState,
  });

  const lobbyRemovePlayersService = removePlayersService({
    lobbyHandler,
    getLobbyState,
  });

  const lobbyStartGameService = startGameService({
    lobbyHandler,
    getLobbyState,
  });

  // Create controllers
  const lobbyAddPlayersController = addPlayersController({
    addPlayers: lobbyAddPlayersService,
  });

  const { controllers: lobbyModifyPlayersController } = modifyPlayersController(
    {
      modifyPlayersService: lobbyModifyPlayersService,
    },
  );

  const lobbyRemovePlayersController = removePlayersController({
    removePlayersService: lobbyRemovePlayersService,
  });

  const lobbyStartGameController = startGameController({
    startGame: lobbyStartGameService,
  });

  // Round management controllers (moved from gameplay)
  // Now properly using lobby dependencies
  const { controller: newRoundController } = newRound({
    getLobbyState,
    lobbyHandler,
  });

  const { controller: dealCardsController } = dealCards({
    getLobbyState,
    lobbyHandler,
  });

  const { controller: startRoundController } = startRound({
    getLobbyState,
    lobbyHandler,
  });

  // Quick start controller
  const { controller: quickStartController } = quickStart({
    lobbyHandler,
    getLobbyState,
    db,
  });

  // Create router and register routes
  const router = Router();

  router.post("/games/:gameId/players", auth, lobbyAddPlayersController);

  router.patch(
    "/games/:gameId/players",
    auth,
    lobbyModifyPlayersController.batch,
  );

  router.patch(
    "/games/:gameId/players/:playerId",
    auth,
    lobbyModifyPlayersController.single,
  );

  router.delete(
    "/games/:gameId/players/:playerId",
    auth,
    lobbyRemovePlayersController,
  );

  router.post("/games/:gameId/start", auth, lobbyStartGameController);

  // Round management routes (moved from gameplay)
  router.post("/games/:gameId/rounds", auth, newRoundController);
  router.post("/games/:gameId/rounds/:id/deal", auth, dealCardsController);
  router.post(
    "/games/:gameId/rounds/:roundNumber/start",
    auth,
    startRoundController,
  );

  // Quick start route
  router.post("/games/:gameId/quick-start", auth, quickStartController);

  // Apply routes and error handlers
  app.use("/api", router);
  app.use("/api", lobbyErrorHandler);
};
