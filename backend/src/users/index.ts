import { Express, Router } from "express";
import { expressjwt } from "express-jwt";
import { Kysely } from "kysely";
import type { DB } from "@backend/common/db/db.types";
import type { JwtConfig } from "src/common/config/jwt.config";
import { getUserController } from "./get-user.controller";

/**
 * Initializes the users feature module
 */
export const initialize = (
  app: Express,
  db: Kysely<DB>,
  jwtConfig: JwtConfig,
) => {
  // Initialize controller
  const getUserHandler = getUserController({ db });

  const router = Router();

  // All routes require authentication
  router.use(
    expressjwt({
      secret: jwtConfig.secret,
      algorithms: ["HS256"],
      getToken: (req) => {
        // Try cookie first
        if (req.cookies?.authToken) {
          return req.cookies.authToken;
        }
        // Fall back to Authorization header
        if (req.headers.authorization?.startsWith("Bearer ")) {
          return req.headers.authorization.substring(7);
        }
        return null;
      },
    }),
  );

  router.get("/:username", getUserHandler);

  app.use("/api/users", router);
};
