import { expressjwt } from "express-jwt";
import { RequestHandler } from "express";

/** Dependencies for creating authentication middleware */
export type Dependencies = {
  jwtSecret: string;
};

/** Authentication middleware type */
export type AuthMiddleware = RequestHandler;

/** Creates authentication middleware */
export const authMiddleware = ({ jwtSecret }: Dependencies) =>
  /**
   * Express middleware to require authentication
   * Uses express-jwt to validate JWT token from Authorization header
   */
  expressjwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  });
