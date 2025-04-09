import type { Request, Response, NextFunction } from "express";
import type { CreateGuestUserService } from "./create-guest-user.service";
import type { LoginService } from "./guest-login.service";
import {
  createGuestResponseSchema,
  createGuestRequestSchema,
  CreateGuestResponse,
} from "./create-guest-session.validation";

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
 * Creates a controller instance for guest user creation
 *
 * @param dependencies - Required service dependencies
 * @returns Controller object with request handler
 *
 */
export const create = ({
  createGuestUserService,
  loginService,
}: Dependencies): CreateGuestUserController => {
  /**
   * HTTP handler for creating a guest user with auto-generated username and session token
   */
  const handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      createGuestRequestSchema.parse(req.body);

      const user = await createGuestUserService.execute();
      const session = await loginService.execute(user.username);

      const response: CreateGuestResponse = {
        success: true,
        data: {
          user: {
            username: user.username,
          },
          session: {
            username: session.username,
            token: session.token,
          },
        },
      };

      const validatedResponse = createGuestResponseSchema.parse(response);

      res.status(201).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };

  return {
    handle,
  };
};
