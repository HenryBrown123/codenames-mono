import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { AddPlayersService } from "./add-players.service";
import {
  addPlayersRequestSchema,
  addPlayersResponseSchema,
  AddPlayersResponse,
} from "./add-players.validation";

/**
 * Controller interface for adding players to game lobbies
 */
export interface AddPlayersController {
  handle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * Dependencies required by the add players controller
 */
export interface Dependencies {
  addPlayersService: AddPlayersService;
}

/**
 * Creates a controller instance for handling player addition requests
 */
export const create = ({
  addPlayersService,
}: Dependencies): AddPlayersController => {
  /**
   * HTTP handler for adding players to a game
   */
  const handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedRequest = addPlayersRequestSchema.parse({
        body: req.body,
        params: req.params,
        auth: req.auth,
      });

      const gameId = validatedRequest.params.gameId;
      const userId = validatedRequest.auth.userId;
      const playersToAdd = validatedRequest.body;

      const playersData = await addPlayersService.execute(
        gameId,
        userId,
        playersToAdd,
      );

      const response: AddPlayersResponse = {
        success: true,
        data: {
          players: playersData.map((player) => ({
            playerId: player.playerId,
            gameId: player.gameId,
            teamId: player.teamId,
            playerName: player.playerName,
          })),
        },
      };

      const validatedResponse = addPlayersResponseSchema.parse(response);

      res.status(201).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };

  return {
    handle,
  };
};
