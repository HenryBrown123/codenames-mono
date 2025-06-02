import {
  GameCreator,
  GameFinder,
  PublicId,
} from "@backend/common/data-access/games.repository";
import { TeamsCreator } from "@backend/common/data-access/teams.repository";
import { GameType, GameFormat } from "@codenames/shared/types";
import shortid from "shortid";

/** Result of game creation */
export type GameCreationResult = {
  _id: number;
  publicId: string;
  createdAt: Date;
  teams: string[];
};

/** Dependencies for the create game service */
export type ServiceDependencies = {
  getGame: GameFinder<PublicId>;
  createGame: GameCreator;
  createTeams: TeamsCreator;
};

/** Creates a game creation service */
export const createGameService = (dependencies: ServiceDependencies) => {
  /**
   * Generates a unique public ID for the game
   * @param getGameDataByPublicId - Function to check existing game IDs
   */
  const generateUniquePublicId = async (): Promise<string> => {
    const MAX_COLLISIONS = 10;

    for (
      let collisionCount = 0;
      collisionCount < MAX_COLLISIONS;
      collisionCount++
    ) {
      const publicId = shortid.generate();
      const existingGame = await dependencies.getGame(publicId);

      if (!existingGame) {
        return publicId;
      }

      console.log(`Public game id collision detected: ${publicId}`);
    }

    throw new Error(
      `Failed to generate unique game ID after ${MAX_COLLISIONS} attempts`,
    );
  };

  /**
   * Creates a new game with specified configuration
   * @param gameType - Type of game
   * @param gameFormat - Format of the game
   */
  return async (
    gameType: GameType,
    gameFormat: GameFormat,
  ): Promise<GameCreationResult> => {
    const publicId = await generateUniquePublicId();

    const game = await dependencies.createGame({
      publicId,
      gameType,
      gameFormat,
    });

    const teams = await dependencies.createTeams({
      gameId: game._id,
      teamNames: ["Team Red", "Team Blue"],
    });

    const uniqueTeamNames = [...new Set(teams.map((team) => team.teamName))];

    return {
      _id: game._id,
      publicId,
      createdAt: game.created_at,
      teams: uniqueTeamNames,
    };
  };
};
