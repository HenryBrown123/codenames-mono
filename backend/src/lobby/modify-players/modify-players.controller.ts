import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { ModifyPlayersService } from "./modify-players.service";

import {
  modifySinglePlayerRequestSchema,
  modifyBatchPlayersRequestSchema,
  singlePlayerResponseSchema,
  batchPlayersResponseSchema,
  SinglePlayerResponse,
  BatchPlayersResponse,
} from "./modify-players.validation";

export interface ModifyPlayersController {
  handleSingle: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  handleBatch: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
}

// Dependencies interface
export interface Dependencies {
  modifyPlayersService: ModifyPlayersService;
}

// Controller factory
export const modifyPlayersController = ({
  modifyPlayersService,
}: Dependencies): ModifyPlayersController => {
  const handleSingle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedReq = modifySinglePlayerRequestSchema.parse({
        params: req.params,
        body: req.body,
        auth: req.auth,
      });

      const { modifiedPlayers, gamePublicId } =
        await modifyPlayersService.updatePlayers(validatedReq.params.gameId, [
          { ...validatedReq.body },
        ]);

      const response: SinglePlayerResponse = {
        success: true,
        data: {
          player: {
            id: modifiedPlayers[0].publicId,
            playerName: modifiedPlayers[0].playerName,
            username: modifiedPlayers[0].username,
            teamName: modifiedPlayers[0].teamName,
            isActive: modifiedPlayers[0].statusId === 1,
          },
          gameId: gamePublicId,
        },
      };

      const validatedResponse = singlePlayerResponseSchema.parse(response);

      res.status(200).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };

  // Batch handler
  const handleBatch = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedReq = modifyBatchPlayersRequestSchema.parse({
        params: req.params,
        body: req.body,
        auth: req.auth,
      });

      const { modifiedPlayers, gamePublicId } =
        await modifyPlayersService.updatePlayers(
          validatedReq.params.gameId,
          validatedReq.body,
        );

      const response: BatchPlayersResponse = {
        success: true,
        data: {
          players: modifiedPlayers.map((player) => ({
            id: player.publicId,
            playerName: player.playerName,
            username: player.username,
            teamName: player.teamName,
            isActive: player.statusId === 1,
          })),
          gameId: gamePublicId,
        },
      };

      const validatedResponse = batchPlayersResponseSchema.parse(response);

      res.status(200).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };

  return {
    handleSingle,
    handleBatch,
  };
};
