import { Request, Response, NextFunction } from "express";
import { AuthService, AuthError } from "./auth.service";

/**
 * Request body for authentication
 */
export interface AuthRequestBody {
  username?: string;
}

/**
 * Controller for handling authentication-related HTTP requests
 */
export interface AuthController {
  createGuestUser: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;

  login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * Dependencies required by the auth controller
 */
export interface Dependencies {
  authService: AuthService;
}

/**
 * Create an auth controller instance
 */
export const create = ({ authService }: Dependencies): AuthController => {
  /**
   * Creates a new guest user with auto-generated username
   */
  const createGuestUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await authService.createGuestUser();
      const session = await authService.createSession(user.username);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
          },
          token: session.token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logs in an existing user by username
   */
  const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { username } = req.body as AuthRequestBody;

    // Input validation - handle directly in controller
    if (!username) {
      res.status(400).json({
        success: false,
        error: "Username is required",
      });
      return;
    }

    try {
      const session = await authService.createSession(username);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: session.userId,
            username: session.username,
          },
          token: session.token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  return {
    createGuestUser,
    login,
  };
};
