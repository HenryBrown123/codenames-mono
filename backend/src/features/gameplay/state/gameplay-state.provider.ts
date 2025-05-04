import { getGameDataByPublicId } from "@backend/common/data-access/games.repository";
import {
  getRoundsByGameId,
  RoundResult,
} from "@backend/common/data-access/rounds.repository";
import { GameAggregate, Round } from "./gameplay-state.types";

/**
 * Creates a function that retrieves complete game state by composing
 * multiple repository calls
 */
export const gameplayStateProvider = (
  getGameById: ReturnType<typeof getGameDataByPublicId>,
  getRounds: ReturnType<typeof getRoundsByGameId>,
) => {
  /**
   * Maps repository round data to domain round data
   */
  const gameplayRoundMapper = (roundData: RoundResult): Round => {
    return {
      id: roundData.id,
      gameId: roundData.gameId,
      roundNumber: roundData.roundNumber,
      status: roundData.status || "SETUP",
      createdAt: roundData.createdAt,
    };
  };

  /**
   * Gets the complete game state by public ID
   * @param gameId Public ID of the game
   * @returns Complete game aggregate or null if not found
   */
  const getGameplayState = async (
    gameId: string,
  ): Promise<GameAggregate | null> => {
    const game = await getGameById(gameId);
    if (!game) return null;

    const roundsData = await getRounds(game.id);
    const rounds = roundsData.map(gameplayRoundMapper);

    return {
      id: game.id,
      public_id: game.public_id,
      status: game.status,
      game_format: game.game_format,
      rounds: rounds,
    };
  };

  return getGameplayState;
};
