import { GetGameByPublicId } from "@backend/common/data-access/games.repository";
import {
  getRoundsByGameId,
  RoundResult,
} from "@backend/common/data-access/rounds.repository";

import { GameAggregate, Round } from "./gameplay-state.types";

export const gameplayStateProvider = (
  getGameById: GetGameByPublicId,
  getRounds: ReturnType<typeof getRoundsByGameId>,
) => {
  const gameplayRoundMapper = (roundData: RoundResult): Round => {
    return {
      id: roundData.id,
      gameId: roundData.gameId,
      roundNumber: roundData.roundNumber,
      status: roundData.status || "SETUP",
      createdAt: roundData.createdAt,
    };
  };

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
