import shortid from "shortid";
import { UnexpectedSetupError } from "./errors/setup.errors";
import { GameType, GameFormat, GAME_TYPE } from "@codenames/shared/types";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { SetupOperations } from "./setup-actions";

/** Result of game creation */
export type GameCreationResult = {
  _id: number;
  publicId: string;
  createdAt: Date;
  teams: string[];
  adminPlayer?: {
    publicId: string;
    playerName: string;
    teamName: string;
  };
};

/** Dependencies for the create game service */
export type ServiceDependencies = {
  setupHandler: TransactionalHandler<SetupOperations>;
};

/** Creates a game creation service */
export const createGameService = (dependencies: ServiceDependencies) => {
  /**
   * Generates a unique public ID for the game
   */
  const generateUniquePublicId = async (): Promise<string> => {
    const MAX_COLLISIONS = 10;

    for (
      let collisionCount = 0;
      collisionCount < MAX_COLLISIONS;
      collisionCount++
    ) {
      const publicId = shortid.generate();
      return publicId;
    }

    throw new UnexpectedSetupError(
      `Failed to generate unique game ID after ${MAX_COLLISIONS} attempts`,
    );
  };

  /**
   * Creates a new game with specified configuration
   * @param gameType - Type of game
   * @param gameFormat - Format of the game
   * @param userId - ID of the user creating the game
   * @param aiMode - Whether to enable AI mode (allows starting with fewer players)
   */
  return async (
    gameType: GameType,
    gameFormat: GameFormat,
    userId: number,
    aiMode: boolean = false,
  ): Promise<GameCreationResult> => {
    const publicId = await generateUniquePublicId();

    return await dependencies.setupHandler(async (setupOps) => {
      // Check for collisions within the transaction
      const existingGame = await setupOps.getGame(publicId);
      if (existingGame) {
        throw new UnexpectedSetupError(
          `Game ID collision detected: ${publicId}`,
        );
      }

      const game = await setupOps.createGame({
        publicId,
        gameType,
        gameFormat,
        aiMode,
        hostUserId: userId,
      });

      const teams = await setupOps.createTeams({
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
    });
  };
};
