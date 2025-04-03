import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "../../infrastructure/db/db.types";
import { Router } from "express";
import { JwtConfig } from "src/infrastructure/config/jwt.config";

// Domain repositories
import * as userRepository from "./domain/user.repository";
import * as sessionRepository from "./domain/session.repository";

// Error handlers
import { authErrorHandler } from "./errors/auth-errors.middleware";

// Create Guest User components
import * as createGuestUserService from "./create-guest-user/create-guest-user.service";
import * as createGuestUserController from "./create-guest-user/create-guest-user.controller";

// Login components
import * as loginService from "./login/login.service";
import * as loginController from "./login/login.controller";

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
    sessionRepository: sessionRepo,
    jwtSecret: jwtConfig.secret,
    jwtOptions: jwtConfig.options,
  });

  const login = loginService.create({
    userRepository: userRepo,
    sessionRepository: sessionRepo,
    jwtSecret: jwtConfig.secret,
    jwtOptions: jwtConfig.options,
  });

  // Create controllers
  const createGuestUserHandler = createGuestUserController.create({
    createGuestUserService: guestUser,
  }).handle;

  const loginHandler = loginController.create({
    loginService: login,
  }).handle;

  // Create router
  const router = Router();

  // Set up routes
  router.post("/users", createGuestUserHandler);
  router.post("/sessions", loginHandler);

  // Apply router and feature-specific error handler
  app.use("/api/auth", router);
  app.use("/api/auth", authErrorHandler);
};
