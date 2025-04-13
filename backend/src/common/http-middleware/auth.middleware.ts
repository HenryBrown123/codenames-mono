import { expressjwt } from "express-jwt";
import { RequestHandler, Request } from "express";

/**
 * Auth middleware functions
 */
export interface AuthMiddleware {
  requireAuthentication: RequestHandler;
}

export interface AuthorizedRequest extends Request {
  auth: { userId: number; username: string };
}

/**
 * Dependencies required by the auth middleware
 */
export interface Dependencies {
  jwtSecret: string;
}

/**
 * Create authentication middleware functions
 */
export const create = ({ jwtSecret }: Dependencies): AuthMiddleware => {
  /**
   * Express middleware to require authentication
   * Uses express-jwt to validate JWT token from Authorization header
   */
  const requireAuthentication = expressjwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  });

  return {
    requireAuthentication,
  };
};
