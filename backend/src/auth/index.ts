import { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "@backend/shared/db/db.types";
import { Router } from "express";
import { expressjwt } from "express-jwt";
import { JwtConfig } from "@backend/shared/config/jwt.config";

import { authErrorHandler } from "./errors/auth-errors.middleware";

import {
  findByUsername,
  createUser,
} from "@backend/shared/data-access/repositories/users.repository";
import { storeSession } from "@backend/shared/data-access/repositories/sessions.repository";

import { createGuestUserService } from "./guest-session/create-guest-user.service";
import { guestLoginService } from "./guest-session/guest-login.service";
import { createGuestUserController } from "./guest-session/create-guest-session.controller";
import { getUserController } from "./get-user.controller";

/**
 * Initializes the authentication feature module
 *
 * Handles guest auth (POST /api/auth/guests) and
 * user profile retrieval (GET /api/users/:username)
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  jwtConfig: JwtConfig,
) => {
  /** Guest auth */
  const findUser = findByUsername(db);
  const newUser = createUser(db);
  const newSession = storeSession(db);

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

  const createGuestHandler = createGuestUserController({
    createGuestUser: guestUser,
    login,
  });

  /** User profile */
  const getUserHandler = getUserController({ db });

  /** Auth routes */
  const authRouter = Router();
  authRouter.post("/guests", createGuestHandler);

  /** User routes (JWT protected) */
  const userRouter = Router();
  userRouter.use(
    expressjwt({
      secret: jwtConfig.secret,
      algorithms: ["HS256"],
      getToken: (req) => {
        if (req.cookies?.authToken) {
          return req.cookies.authToken;
        }
        if (req.headers.authorization?.startsWith("Bearer ")) {
          return req.headers.authorization.substring(7);
        }
        return null;
      },
    }),
  );
  userRouter.get("/:username", getUserHandler);

  app.use("/api/auth", authRouter);
  app.use("/api/auth", authErrorHandler);
  app.use("/api/users", userRouter);
};
