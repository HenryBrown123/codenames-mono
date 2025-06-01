// src/features/lobby/index.ts

import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

// Import repositories
import {
  findGameByPublicId as getGameDataByPublicId,
  updateGameStatus,
} from "@backend/common/data-access/games.repository";
import {
  addPlayers,
  findPlayerById as getPlayerById,
  removePlayer,
  modifyPlayers,
  findPlayersByGameId as getPlayersByGameId,
} from "@backend/common/data-access/players.repository";

// Import feature components
import { addPlayersService } from "./add-players/add-players.service";
import { addPlayersController } from "./add-players/add-players.controller";

import { modifyPlayersService } from "./modify-players/modify-players.service";
import { modifyPlayersController } from "./modify-players/modify-players.controller";

import { removePlayersService } from "./remove-players/remove-players.service";
import { removePlayersController } from "./remove-players/remove-players.controller";

// Import new start game components
import { startGameService } from "./start-game/start-game.service";
import { startGameController } from "./start-game/start-game.controller";

// Import error handlers
import { lobbyErrorHandler } from "./errors/lobby-errors.middleware";

/** Initializes the lobby feature module with all routes and dependencies */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  // Create repository functions
  const getGetGameDataByPublicId = getGameDataByPublicId(db);
  const getAddPlayers = addPlayers(db);
  const getPlayers = getPlayerById(db);
  const getRemovePlayer = removePlayer(db);
  const getModifyPlayers = modifyPlayers(db);
  const getPlayersByPrivateGameId = getPlayersByGameId(db);
  const updateGameStatusFn = updateGameStatus(db);

  // Create service functions
  const lobbyAddPlayersService = addPlayersService({
    getGameByPublicId: getGetGameDataByPublicId,
    addPlayers: getAddPlayers,
  });

  const lobbyModifyPlayersService = modifyPlayersService({
    getGameByPublicId: getGetGameDataByPublicId,
    modifyPlayers: getModifyPlayers,
  });

  const lobbyRemovePlayersService = removePlayersService({
    getGameByPublicId: getGetGameDataByPublicId,
    removePlayer: getRemovePlayer,
    getPlayer: getPlayers,
  });

  // Create the start game service
  const lobbyStartGameService = startGameService({
    getGameByPublicId: getGetGameDataByPublicId,
    updateGameStatus: updateGameStatusFn,
    getPlayersByGameId: getPlayersByPrivateGameId,
  });

  // Create controllers
  const lobbyAddPlayersController = addPlayersController({
    addPlayers: lobbyAddPlayersService,
  });

  const lobbyModifyPlayersController = modifyPlayersController({
    modifyPlayersService: lobbyModifyPlayersService,
  });

  const lobbyRemovePlayersController = removePlayersController({
    removePlayersService: lobbyRemovePlayersService,
  });

  // Create the start game controller
  const lobbyStartGameController = startGameController({
    startGame: lobbyStartGameService,
  });

  // Create router and register routes
  const router = Router();

  router.post("/games/:gameId/players", auth, lobbyAddPlayersController);

  router.patch(
    "/games/:gameId/players",
    auth,
    lobbyModifyPlayersController.handleBatch,
  );

  router.patch(
    "/games/:gameId/players/:playerId",
    auth,
    lobbyModifyPlayersController.handleSingle,
  );

  router.delete(
    "/games/:gameId/players/:playerId",
    auth,
    lobbyRemovePlayersController,
  );

  router.post("/games/:gameId/start", auth, lobbyStartGameController);

  // Apply routes and error handlers
  app.use("/api", router);
  app.use("/api", lobbyErrorHandler);
};
