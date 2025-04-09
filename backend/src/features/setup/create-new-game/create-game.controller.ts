import type { Request, Response, NextFunction } from "express";
import type { CreateGameService } from "./create-game.service";
import {
  createGameRequestSchema,
  createGameResponseSchema,
  CreateGameResponse,
} from "./create.game.validation";

/**
 * Controller interface for creating new games
 */
export interface CreateGameController {
  handle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * Dependencies required by the create game controller
 */
export interface Dependencies {
  createGameService: CreateGameService;
}

/**
 * Creates a controller instance for handling game creation requests
 * @param dependencies - Required dependencies for the controller
 *
 * @returns HTTP Controller instance
 */
export const create = ({
  createGameService,
}: Dependencies): CreateGameController => {
  /**
   * HTTP handler for creating a new game
   * Validates request, creates game, and returns game details
   */
  const handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // run time validation of req object
      const parsedReq = createGameRequestSchema.parse(req.body);

      const { publicId, createdAt } = await createGameService.execute(
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

      // run time validation of response object
      const validatedResponse = createGameResponseSchema.parse(response);

      res.status(201).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };

  return {
    handle,
  };
};
