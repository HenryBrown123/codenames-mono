import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "../../infrastructure/db/db.types";
import { Router } from "express";
import { JwtConfig } from "src/infrastructure/config/jwt.config";

// Error handlers
import { authErrorHandler } from "./errors/auth-errors.middleware";

// Domain repositories
import * as userRepository from "./domain/user.repository";
import * as sessionRepository from "./domain/session.repository";

// Create Guest User components
import * as createGuestUserService from "./create-guest-session/create-guest-user.service";
import * as guestLoginService from "./create-guest-session/guest-login.service";
import * as createGuestUserController from "./create-guest-session/create-guest-session.controller";

/**
 * Initialize the auth feature
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  jwtConfig: JwtConfig,
) => {
  // Create domain repositories
  const userRepo = userRepository.create({ db });
  const sessionRepo = sessionRepository.create({ db });

  // Create services
  const guestUser = createGuestUserService.create({
    userRepository: userRepo,
  });

  const login = guestLoginService.create({
    userRepository: userRepo,
    sessionRepository: sessionRepo,
    jwtSecret: jwtConfig.secret,
    jwtOptions: jwtConfig.options,
  });

  // Create controller
  const createGuestUserHandler = createGuestUserController.create({
    createGuestUserService: guestUser,
    loginService: login,
  }).handle;

  // Create router
  const router = Router();

  // Set up routes
  router.post("/guests", createGuestUserHandler);

  // Apply router and feature-specific error handler
  app.use("/api/auth", router);
  app.use("/api/auth", authErrorHandler);
};
