import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

// Import repositories
import {
  findGameByPublicId,
  updateGameStatus,
} from "@backend/common/data-access/games.repository";

import {
  addPlayers,
  findPlayerByPublicId,
  removePlayer,
  modifyPlayers,
  findPlayersByGameId,
} from "@backend/common/data-access/players.repository";
import { getTeamNameToIdMap } from "@backend/common/data-access/teams.repository";

// Import feature components
import { addPlayersService } from "./add-players/add-players.service";
import { addPlayersController } from "./add-players/add-players.controller";

import { modifyPlayersService } from "./modify-players/modify-players.service";
import { modifyPlayersController } from "./modify-players/modify-players.controller";

import { removePlayersService } from "./remove-players/remove-players.service";
import { removePlayersController } from "./remove-players/remove-players.controller";

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
  const gameByPublicId = findGameByPublicId(db);
  const playersCreator = addPlayers(db);
  const playerByPublicId = findPlayerByPublicId(db);
  const playerRemover = removePlayer(db);
  const playersUpdater = modifyPlayers(db);
  const playersByGameId = findPlayersByGameId(db);
  const gameStatusUpdater = updateGameStatus(db);
  const teamNameMapper = getTeamNameToIdMap(db);

  // Create service functions
  const lobbyAddPlayersService = addPlayersService({
    getGameByPublicId: gameByPublicId,
    addPlayers: playersCreator,
    getTeamNameToIdMap: teamNameMapper,
  });

  const lobbyModifyPlayersService = modifyPlayersService({
    getGameByPublicId: gameByPublicId,
    modifyPlayers: playersUpdater,
  });

  const lobbyRemovePlayersService = removePlayersService({
    getGameByPublicId: gameByPublicId,
    removePlayer: playerRemover,
    getPlayer: playerByPublicId,
  });

  const lobbyStartGameService = startGameService({
    getGameByPublicId: gameByPublicId,
    updateGameStatus: gameStatusUpdater,
    getPlayersByGameId: playersByGameId,
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
