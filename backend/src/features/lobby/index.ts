import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

// Import repositories
import * as gameRepository from "@backend/common/data-access/games.repository";
import * as playerRepository from "@backend/common/data-access/players.repository";

// Import feature components
import * as addPlayersService from "./add-players/add-players.service";
import * as addPlayersController from "./add-players/add-players.controller";

import * as modifyPlayersService from "./modify-players/modify-players.service";
import * as modifyPlayersController from "./modify-players/modify-players.controller";

import * as removePlayerService from "./remove-players/remove-players.service";
import * as removePlayerController from "./remove-players/remove-players.controller";

// Import error handlers
import { lobbyErrorHandler } from "./errors/lobby-errors.middleware";

/**
 * Initializes the lobby feature module with all routes and dependencies
 *
 * @param app - Express application instance
 * @param db - Database connection
 * @param auth - Authentication middleware
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  /**
   * Create feature services and controllers and wire up any dependencies
   */
  const gameRepo = gameRepository.create({ db });
  const playerRepo = playerRepository.create({ db });

  const addPlayers = addPlayersService.create({
    gameRepository: gameRepo,
    playerRepository: playerRepo,
  });

  const addPlayersHandler = addPlayersController.create({
    addPlayersService: addPlayers,
  });

  const removePlayers = removePlayerService.create({
    gameRepository: gameRepo,
    playerRepository: playerRepo,
  });

  const removePlayerHandler = removePlayerController.create({
    removePlayersService: removePlayers,
  });

  const modifyPlayers = modifyPlayersService.create({
    gameRepository: gameRepo,
    playerRepository: playerRepo,
  });

  const modifyPlayerController = modifyPlayersController.create({
    modifyPlayersService: modifyPlayers,
  });

  const router = Router();

  router.post(
    "/games/:gameId/players",
    auth.requireAuthentication,
    addPlayersHandler.handle,
  );

  /**
   * Players can be modified individually or batch
   */

  router.patch(
    "/games/:gameId/players",
    auth.requireAuthentication,
    modifyPlayerController.handleBatch,
  );

  router.patch(
    "/games/:gameId/players/:playerId",
    auth.requireAuthentication,
    modifyPlayerController.handleSingle,
  );

  router.delete(
    "/games/:gameId/players/:playerId",
    auth.requireAuthentication,
    removePlayerHandler.handle,
  );

  // Apply routes and error handlers
  app.use("/api", router);
  app.use("/api", lobbyErrorHandler);
};
