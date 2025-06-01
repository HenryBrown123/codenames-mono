import type { Response, NextFunction } from "express";
import type { Request } from "express-jwt";
import type { ModifyPlayersService } from "./modify-players.service";

import {
  modifySinglePlayerRequestSchema,
  modifyBatchPlayersRequestSchema,
  singlePlayerResponseSchema,
  batchPlayersResponseSchema,
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
        parms: req.params,
        body: req.body,
        auth: req.auth,
      });

      const modifiedPlayers = await modifyPlayersService.updatePlayers(
        validatedReq.params.gameId,
        [{ ...validatedReq.body }],
      );

      const validatedResponse =
        singlePlayerResponseSchema.parse(modifiedPlayers);

      res.status(201).json(validatedResponse);
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
        parms: req.params,
        body: req.body,
        auth: req.auth,
      });

      const modifiedPlayers = await modifyPlayersService.updatePlayers(
        validatedReq.params.gameId,
        validatedReq.body,
      );

      const validatedResponse =
        batchPlayersResponseSchema.parse(modifiedPlayers);

      res.status(201).json(validatedResponse);
    } catch (error) {
      next(error);
    }
  };

  return {
    handleSingle,
    handleBatch,
  };
};
