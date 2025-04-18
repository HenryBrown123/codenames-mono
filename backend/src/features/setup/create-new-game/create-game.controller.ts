import type { Request, Response, NextFunction } from "express";
import { createGameService } from "./create-game.service";
import {
  createGameRequestSchema,
  createGameResponseSchema,
  CreateGameResponse,
} from "./create.game.validation";

/** Dependencies required by the create game controller */
export type Dependencies = {
  createGame: ReturnType<typeof createGameService>;
};

/** Creates a controller for handling game creation requests */
export const createGameController =
  ({ createGame }: Dependencies) =>
  /**
   * Handles HTTP request to create a new game
   * @param req - Express request with game creation details
   * @param res - Express response object
   * @param next - Express error handling function
   */
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Runtime validation of request object
      const parsedReq = createGameRequestSchema.parse(req.body);

      const { publicId, createdAt } = await createGame(
        parsedReq.gameType,
        parsedReq.gameFormat,
      );

      const response: CreateGameResponse = {
        success: true,
        data: {
          game: {
            publicId: publicId,
            gameFormat: parsedReq.gameFormat,
            gameType: parsedReq.gameType,
            createdAt: createdAt,
          },
        },
      };

      // Runtime validation of response object
      const validatedResponse = createGameResponseSchema.parse(response);

      res.status(201).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };
