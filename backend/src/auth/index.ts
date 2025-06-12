import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";
import { Router } from "express";
import { JwtConfig } from "src/common/config/jwt.config";

import { authErrorHandler } from "./errors/auth-errors.middleware";

import {
  findByUsername,
  createUser,
} from "@backend/common/data-access/repositories/users.repository";
import { storeSession } from "@backend/common/data-access/repositories/sessions.repository";

import { createGuestUserService } from "./create-guest-session/create-guest-user.service";
import { guestLoginService } from "./create-guest-session/guest-login.service";
import { createGuestUserController } from "./create-guest-session/create-guest-session.controller";

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
  // Initialize repositories
  const findUser = findByUsername(db);
  const newUser = createUser(db);
  const newSession = storeSession(db);

  // Initialize services
  const guestUser = createGuestUserService({
    findUser,
    createUser: newUser,
  });

  const login = guestLoginService({
    findUser,
    storeSession: newSession,
    jwtSecret: jwtConfig.secret,
    jwtOptions: jwtConfig.options,
  });

  // Initialize controller
  const createGuestHandler = createGuestUserController({
    createGuestUser: guestUser,
    login,
  });

  const router = Router();
  router.post("/guests", createGuestHandler);

  app.use("/api/auth", router);
  app.use("/api/auth", authErrorHandler);
};
