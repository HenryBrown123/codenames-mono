import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

// Import repositories
import {
  findGameByPublicId,
  createGame,
} from "@backend/common/data-access/repositories/games.repository";
import { createTeams } from "@backend/common/data-access/repositories/teams.repository";

// Import feature components
import { createGameService } from "./create-new-game/create-game.service";
import { createGameController } from "./create-new-game/create-game.controller";

// Import error handlers
import { setupErrorHandler } from "./errors/setup-errors.middleware";

/** Initializes the setup feature module with all routes and dependencies */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  const getGame = findGameByPublicId(db);
  const newGame = createGame(db);
  const newTeam = createTeams(db);

  const setupGameService = createGameService({
    getGame: getGame,
    createGame: newGame,
    createTeams: newTeam,
  });

  const setupGameController = createGameController({
    createGame: setupGameService,
  });

  const router = Router();

  router.post("/games", auth, setupGameController);

  app.use("/api", router);
  app.use("/api", setupErrorHandler);
};
