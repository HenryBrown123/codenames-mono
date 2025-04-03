import { Request, Response, NextFunction } from "express";
import { LoginService } from "./login.service";

/**
 * Request data structure for login endpoint
 */
export interface LoginRequest {
  username: string;
}

/**
 * Response data structure for login endpoint
 */
export interface LoginResponse {
  user: {
    id: number;
    username: string;
  };
  token: string;
}

/**
 * Controller interface for user login
 */
export interface LoginController {
  handle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * Dependencies required by the login controller
 */
export interface Dependencies {
  loginService: LoginService;
}

/**
 * Create a controller instance for login operations
 */
export const create = ({ loginService }: Dependencies): LoginController => {
  /**
   * HTTP handler for user login
   */
  const handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { username } = req.body as LoginRequest;

      if (!username) {
        res.status(400).json({
          success: false,
          error: "Username is required",
        });
        return;
      }

      const result = await loginService.execute(username);

      if (!result.success) {
        console.log(`Login failed: ${result.reason}`);

        res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
        return;
      }

      const response: LoginResponse = {
        user: {
          id: result.session.userId,
          username: result.session.username,
        },
        token: result.session.token,
      };

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  return {
    handle,
  };
};
