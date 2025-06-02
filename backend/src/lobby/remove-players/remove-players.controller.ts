import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import { removePlayersService } from "./remove-players.service";
import {
  removePlayersRequestSchema,
  removePlayersResponseSchema,
  RemovePlayersResponse,
} from "./remove-players.validation";

/** Dependencies required by the remove players controller */
export type Dependencies = {
  removePlayersService: ReturnType<typeof removePlayersService>;
};

/** Creates a controller for removing players from a game lobby */
export const removePlayersController =
  ({ removePlayersService }: Dependencies) =>
  /**
   * Handles HTTP request to remove a player from a game
   * @param req - Express request with game and player details
   * @param res - Express response object
   * @param next - Express error handling function
   */
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedRequest = removePlayersRequestSchema.parse({
        params: req.params,
        auth: req.auth,
      });

      const gameId = validatedRequest.params.gameId;
      const userId = validatedRequest.auth.userId;
      const playerIdToRemove = validatedRequest.params.playerId;

      const { removedPlayer, gamePublicId } = await removePlayersService(
        gameId,
        userId,
        playerIdToRemove,
      );

      const response: RemovePlayersResponse = {
        success: true,
        data: {
          removedPlayer: {
            id: removedPlayer.publicId,
            playerName: removedPlayer.playerName,
            username: removedPlayer.username,
            teamName: removedPlayer.teamName,
            isActive: removedPlayer.statusId === 1,
          },
          gameId: gamePublicId,
        },
      };

      const validatedResponse = removePlayersResponseSchema.parse(response);

      res.status(200).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };
