import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import { addPlayersService } from "./add-players.service";
import {
  addPlayersRequestSchema,
  addPlayersResponseSchema,
  AddPlayersResponse,
} from "./add-players.validation";

/** Dependencies required for the add players controller */
export type Dependencies = {
  addPlayers: ReturnType<typeof addPlayersService>;
};

/** Creates a controller for adding players to a game lobby */
export const addPlayersController =
  ({ addPlayers }: Dependencies) =>
  /**
   * Handles HTTP request to add players to a game
   * @param req - Express request with game and player details
   * @param res - Express response object
   * @param next - Express error handling function
   */
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedRequest = addPlayersRequestSchema.parse({
        body: req.body,
        params: req.params,
        auth: req.auth,
      });

      const gameId = validatedRequest.params.gameId;
      const userId = validatedRequest.auth.userId;
      const playersToAdd = validatedRequest.body;

      const playersData = await addPlayers(gameId, userId, playersToAdd);

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
