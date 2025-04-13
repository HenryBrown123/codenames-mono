import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { AddPlayersService } from "./add-players.service";
import {
  addPlayersRequestSchema,
  addPlayersResponseSchema,
  AddPlayersResponse,
} from "./add-players.validation";

import { ExpressJwtRequest } from "express-jwt";

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
      const validatedPlayers = addPlayersRequestSchema.parse({
        body: req.body,
        params: req.params,
        auth: req.auth,
      });

      const gameId = validatedPlayers.params.id;
      const userId = validatedPlayers.auth.userId;
      const playersToAdd = validatedPlayers.body;

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
