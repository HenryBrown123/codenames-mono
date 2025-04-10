// Import feature dependencies
import * as createGameController from "./create-new-game/create-game.controller";
import * as createGameService from "./create-new-game/create-game.service";
import * as gameRpository from "@backend/common/data-access/games.repository";
import { setupErrorHandler } from "./errors/setup-errors.middleware";

// Import non-feature dependencies

import { DB } from "@backend/common/db/db.types";
import { Kysely } from "kysely";
import { Express } from "express";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";

/**
 * Initializes the setup feature routes and dependencies
 * @param app - Express application instance
 * @param db - Database connection
 * @param jwt - JWT configuration
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  const setupRepo = gameRpository.create({ db });
  const setupService = createGameService.create({ gameRepository: setupRepo });

  const setupHandler = createGameController.create({
    createGameService: setupService,
  }).handle;

  const requireAuth = auth.requireAuthentication;

  const router = Router();

  router.post("/games", requireAuth, setupHandler);

  app.use("/api/", router);
  app.use("/api/", setupErrorHandler);
};
