import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "../../common/db/db.types";
import { Router } from "express";
import { JwtConfig } from "src/common/config/jwt.config";

// Error handlers
import { authErrorHandler } from "./errors/auth-errors.middleware";

// Domain repositories
import * as userRepository from "../../common/data-access/users.repository";
import * as sessionRepository from "../../common/data-access/sessions.repository";

// Create Guest User components
import * as createGuestUserService from "./create-guest-session/create-guest-user.service";
import * as guestLoginService from "./create-guest-session/guest-login.service";
import * as createGuestUserController from "./create-guest-session/create-guest-session.controller";

/**
 * Initializes the authentication feature module
 *
 * This function sets up all authentication-related components:
 * - Repositories for data access
 * - Services for business logic
 * - Controllers for HTTP handling
 * - Routes for API endpoints
 * - Error handlers for auth-specific errors
 *
 * @param app - Express application instance
 * @param db - Database connection
 * @param jwtConfig - JWT configuration options
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  jwtConfig: JwtConfig,
) => {
  const userRepo = userRepository.create({ db });
  const sessionRepo = sessionRepository.create({ db });

  const guestUser = createGuestUserService.create({
    userRepository: userRepo,
  });

  const login = guestLoginService.create({
    userRepository: userRepo,
    sessionRepository: sessionRepo,
    jwtSecret: jwtConfig.secret,
    jwtOptions: jwtConfig.options,
  });

  const createGuestUserHandler = createGuestUserController.create({
    createGuestUserService: guestUser,
    loginService: login,
  }).handle;

  const router = Router();

  router.post("/guests", createGuestUserHandler);

  app.use("/api/auth", router);
  app.use("/api/auth", authErrorHandler);
};
