import { GameRepository } from "@backend/common/data-access/games.repository";
import { GameType, GameFormat } from "@codenames/shared/types";
import shortid from "shortid";

// Game setup service result
export interface GameSetupResult {
  id: number;
  publicId: string;
  gameType: GameType;
  gameFormat: GameFormat;
}

export interface GameSetupService {
  execute: (
    gameType: GameType,
    gameFormat: GameFormat,
  ) => Promise<GameSetupResult>;
}

export interface Dependencies {
  gameRepository: GameRepository;
}

export const create = ({ gameRepository }: Dependencies): GameSetupService => {
  /**
   * Creates a new game with the specified configuration
   */
  const execute = async (
    gameType: GameType,
    gameFormat: GameFormat,
  ): Promise<GameSetupResult> => {
    const publicId = await getUniqueShortId();

    const game = await gameRepository.createGame(
      publicId,
      gameType,
      gameFormat,
    );

    return {
      id: game.id,
      publicId,
      gameType,
      gameFormat,
    };
  };

  /**
   * Derive a unique random username for guests..
   */

  const getUniqueShortId = async (): Promise<string> => {
    const MAX_COLLISIONS = 10;
    let publicId = shortid.generate();

    for (
      let collisionCount = 0;
      collisionCount < MAX_COLLISIONS;
      collisionCount++
    ) {
      const existingGame = await gameRepository.getGameDataByPublicId(publicId);
      if (existingGame) {
        console.log(`Public game id collision detected: ${publicId}`);
        continue;
      }
      return publicId;
    }

    throw new Error(
      `Failed to generate unique  username... reached max collisions (10)`,
    );
  };

  return {
    execute,
  };
};
