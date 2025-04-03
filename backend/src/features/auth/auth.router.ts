import { Router } from "express";
import { AuthController } from "./auth.controller";

/**
 * Dependencies required by the auth routes
 */
export interface Dependencies {
  authController: AuthController;
}

/**
 * Create auth routes with controller functions
 */
export const create = ({ authController }: Dependencies): Router => {
  const router = Router();

  // User endpoints
  router.post("/users", authController.createGuestUser);

  // Auth/Session endpoints
  router.post("/sessions", authController.login);

  return router;
};
