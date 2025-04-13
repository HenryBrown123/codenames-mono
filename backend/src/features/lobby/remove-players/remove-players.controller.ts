import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { RemovePlayersService } from "./remove-players.service";
import {
  removePlayersRequestSchema,
  removePlayersResponseSchema,
} from "./remove-players.validation";

/**
 * Controller interface for removing players from game lobbies
 */
export interface RemovePlayersController {
  handle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * Dependencies required by the remove players controller
 */
export interface Dependencies {
  removePlayersService: RemovePlayersService;
}

/**
 * Creates a controller instance for handling player removal requests
 */
export const create = ({
  removePlayersService,
}: Dependencies): RemovePlayersController => {
  /**
   * HTTP handler for removing a player from a game
   */
  const handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedRequest = removePlayersRequestSchema.parse({
        params: req.params,
        auth: req.auth,
      });

      const gameId = validatedRequest.params.id;
      const userId = validatedRequest.auth.userId;
      const playerIdToRemove = validatedRequest.params.playerId;

      const { playersData: remainingPlayers, gameId: publicGameId } =
        await removePlayersService.execute(gameId, userId, playerIdToRemove);

      const response = {
        success: true,
        data: {
          players: remainingPlayers,
          publicId: publicGameId,
        },
      };

      const validatedResponse = removePlayersResponseSchema.parse(response);

      res.status(200).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };

  return {
    handle,
  };
};
