import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";
import { createTransactionalHandler } from "@backend/common/data-access/transaction-handler";

// Import feature components
import { createGameService } from "./create-new-game/create-game.service";
import { createGameController } from "./create-new-game/create-game.controller";

// Import actions and error handlers
import { setupOperations } from "./setup-actions";
import { setupErrorHandler } from "./errors/setup-errors.middleware";

/** Initializes the setup feature module with all routes and dependencies */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  auth: AuthMiddleware,
) => {
  // Transaction handler with setup operations
  const setupHandler = createTransactionalHandler(db, setupOperations);

  const setupGameService = createGameService({
    setupHandler,
  });

  const setupGameController = createGameController({
    createGame: setupGameService,
  });

  const router = Router();

  router.post("/games", auth, setupGameController);

  app.use("/api", router);
  app.use("/api", setupErrorHandler);
};
