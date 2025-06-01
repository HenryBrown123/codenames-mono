import {
  PublicId,
  InternalId,
  GameFinder,
  GameStatusUpdater,
} from "@backend/common/data-access/games.repository";

import { PlayerFinderAll } from "@backend/common/data-access/players.repository";

import { GAME_STATE } from "@codenames/shared/types";
import { validateGameCanBeStarted } from "./start-game.validation";

/** Required dependencies for creating the StartGameService */
export type ServiceDependencies = {
  getGameByPublicId: GameFinder<PublicId>;
  updateGameStatus: GameStatusUpdater;
  getPlayersByGameId: PlayerFinderAll<InternalId>;
};

/** Game start success result */
export type GameStartSuccess = {
  _id: number;
  success: true;
  publicId: string;
  status: string;
};

/** Game start error result */
export type GameStartError = {
  success: false;
  error: string;
};

/** Combined game start result type */
export type GameStartResult = GameStartSuccess | GameStartError;

/** Creates an implementation of the start game service */
export const startGameService = (dependencies: ServiceDependencies) => {
  /**
   * Attempts to start a game by updating its status
   * @param publicGameId - Public identifier of the game
   * @returns Result object indicating success or failure with details
   */
  const startGame = async (publicGameId: string): Promise<GameStartResult> => {
    const game = await dependencies.getGameByPublicId(publicGameId);
    if (!game) {
      return {
        success: false,
        error: `Game with public ID ${publicGameId} not found`,
      };
    }

    const players = await dependencies.getPlayersByGameId(game._id);

    const validationResult = validateGameCanBeStarted(game.status, players);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.reason,
      };
    }

    const updatedGame = await dependencies.updateGameStatus(
      game._id,
      GAME_STATE.IN_PROGRESS,
    );

    return {
      success: true,
      _id: updatedGame._id,
      publicId: updatedGame.public_id,
      status: updatedGame.status,
    };
  };

  return startGame;
};
