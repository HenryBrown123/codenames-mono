import type { Request, Response, NextFunction } from "express";
import type { GuestUser } from "./create-guest-user.service";
import type { GuestLoginService } from "./guest-login.service";
import {
  createGuestResponseSchema,
  createGuestRequestSchema,
  CreateGuestResponse,
} from "./create-guest-session.validation";

/** Dependencies required by the guest user controller */
type ControllerDependencies = {
  createGuestUser: () => Promise<GuestUser>;
  login: GuestLoginService;
};

/** Creates a controller for handling guest user creation requests */
export const createGuestUserController =
  ({ createGuestUser, login }: ControllerDependencies) =>
  /**
   * Handles HTTP request to create a new guest user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express error handling function
   */
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      createGuestRequestSchema.parse(req.body);

      const user = await createGuestUser();
      const session = await login(user.username);

      const response: CreateGuestResponse = {
        success: true,
        data: {
          user: {
            username: user.username,
          },
          session: {
            username: user.username,
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
