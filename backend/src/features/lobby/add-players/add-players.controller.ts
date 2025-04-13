// src/features/lobby/add-players/add-players.controller.ts
import type { Request, Response, NextFunction } from "express";
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
      // Validate just the request body
      const validatedPlayers = addPlayersRequestSchema.parse(req.body);

      const gameId = req.params.id;

      // Extract userId from auth
      const userId = req.auth.userId;

      // Add players to the game
      const playersData = await addPlayersService.execute(
        gameId,
        userId,
        validatedPlayers,
      );

      // Prepare response
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

      // Validate response
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
