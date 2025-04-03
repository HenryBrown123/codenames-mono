import { Request, Response, NextFunction } from "express";
import { CreateGuestUserService } from "./create-guest-user.service";

/**
 * Response data structure for create guest user endpoint
 */
export interface CreateGuestUserResponse {
  user: {
    id: number;
    username: string;
  };
  token: string;
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
}

/**
 * Create a controller instance for guest user creation
 */
export const create = ({
  createGuestUserService,
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
      const session = await createGuestUserService.execute();

      const response: CreateGuestUserResponse = {
        user: {
          id: session.userId,
          username: session.username,
        },
        token: session.token,
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
