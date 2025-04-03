import type { Request, Response, NextFunction } from "express";
import type { CreateGuestUserService } from "./create-guest-user.service";
import type { LoginService } from "./guest-login.service";
import type { Session } from "../domain/session.types";
/**
 * Response data structure for create guest user endpoint
 */
export interface CreateGuestUserResponse {
  user: {
    username: string;
  };
  session: Session;
}

/**
 * Controller interface for creating guest users
 */
export interface CreateGuestUserController {
  handle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * Dependencies required by the create guest user controller
 */
export interface Dependencies {
  createGuestUserService: CreateGuestUserService;
  loginService: LoginService;
}

/**
 * Create a controller instance for guest user creation
 */
export const create = ({
  createGuestUserService,
  loginService,
}: Dependencies): CreateGuestUserController => {
  /**
   * HTTP handler for creating a guest user
   */
  const handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await createGuestUserService.execute();
      const session = await loginService.execute(user.username);

      const response: CreateGuestUserResponse = {
        user: {
          username: user.username,
        },
        session,
      };

      res.status(201).json({
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
