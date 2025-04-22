import {
  getGameDataByPublicId,
  updateGameStatus,
} from "@backend/common/data-access/games.repository";
import { getPlayersByGameId } from "@backend/common/data-access/players.repository";
import { validateGameCanBeStarted } from "./start-game.validation";

/** Required dependencies for creating the StartGameService */
export type ServiceDependencies = {
  getGameByPublicId: ReturnType<typeof getGameDataByPublicId>;
  updateGameStatus: ReturnType<typeof updateGameStatus>;
  getPlayersByGameId: ReturnType<typeof getPlayersByGameId>;
};

/** Game start success result */
export type GameStartSuccess = {
  success: true;
  gameId: number;
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

    const players = await dependencies.getPlayersByGameId(game.id);

    const validationResult = validateGameCanBeStarted(game.status, players);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.reason,
      };
    }

    const updatedGame = await dependencies.updateGameStatus(
      game.id,
      "IN_PROGRESS",
    );

    return {
      success: true,
      gameId: updatedGame.id,
      publicId: updatedGame.public_id,
      status: updatedGame.status,
    };
  };

  return startGame;
};
