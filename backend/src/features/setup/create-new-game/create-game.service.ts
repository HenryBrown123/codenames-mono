import { GameRepository } from "@backend/common/data-access/games.repository";
import { GameType, GameFormat } from "@codenames/shared/types";
import shortid from "shortid";

/**
 * Service interface for creating new game instances
 */
export interface CreateGameService {
  execute: (
    gameType: GameType,
    gameFormat: GameFormat,
  ) => Promise<{
    publicId: string;
    id: number;
    createdAt: Date;
  }>;
}

/**
 * Required dependencies for the create game service
 */
export interface Dependencies {
  gameRepository: GameRepository;
}

/**
 * Creates a service instance for handling game creation operations
 * @param dependencies - Required dependencies for the service
 * @returns Service instance with game creation capability
 */
export const create = ({ gameRepository }: Dependencies): CreateGameService => {
  /**
   * Creates a new game with the specified configuration
   * @param gameType - The type of game (single or multi device)
   * @param gameFormat - The format of the game (quick, best of three, round robin)
   * @returns Promise containing the created game's details
   */
  const execute = async (gameType: GameType, gameFormat: GameFormat) => {
    const publicId = await getUniqueShortId();

    const game = await gameRepository.createGame(
      publicId,
      gameType,
      gameFormat,
    );

    return {
      id: game.id,
      publicId,
      createdAt: game.created_at,
    };
  };

  /**
   * Generates a unique public ID for the game
   * Retries up to MAX_COLLISIONS times if collision occurs
   * @returns Promise containing the unique public ID
   * @throws Error if unable to generate unique ID after max attempts
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
