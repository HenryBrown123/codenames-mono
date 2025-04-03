import type { Express } from "express";
import type { Kysely } from "kysely";
import type { DB } from "src/infrastructure/db/db.types";
import type { SignOptions } from "jsonwebtoken";

import * as usersRepository from "./repositories/users.repository";
import * as authRepository from "./repositories/sessions.repository";
import * as authService from "./auth.service";
import * as authController from "./auth.controller";
import * as authMiddleware from "../../infrastructure/http-middleware/auth.middleware";
import * as authRoutes from "./auth.router";
import { authErrorHandler } from "./shared/auth-errors.middleware";

/**
 * Configuration options for the auth feature
 */
export interface AuthConfig {
  jwtSecret: string;
  jwtOptions: SignOptions;
}

/**
 * Initialize the auth feature
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  config: AuthConfig,
) => {
  // create repositories
  const users = usersRepository.create({ db });
  const auth = authRepository.create({ db });

  // create services
  const service = authService.create({
    usersRepository: users,
    authRepository: auth,
    jwtSecret: config.jwtSecret,
    jwtOptions: config.jwtOptions,
  });

  // create controllers
  const controller = authController.create({ authService: service });

  // create middleware
  const middleware = authMiddleware.create({
    jwtSecret: config.jwtSecret,
  });

  // Initialize and register routes
  const router = authRoutes.create({
    authController: controller,
  });

  // Apply feature router + dedicated error handler
  app.use("/api/auth", router);
  app.use("/api/auth", authErrorHandler);

  // Return components for other features to use
  return {
    middleware,
  };
};
