import type { Request, Response, NextFunction } from "express";
import type { GuestUser } from "./create-guest-user.service";
import type { Session } from "@backend/common/data-access/sessions.repository";
import {
  createGuestResponseSchema,
  createGuestRequestSchema,
  CreateGuestResponse,
} from "./create-guest-session.validation";

type ControllerDependencies = {
  createGuestUser: () => Promise<GuestUser>;
  login: (username: string) => Promise<Session>;
};

export const createGuestUserController =
  ({ createGuestUser, login }: ControllerDependencies) =>
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
