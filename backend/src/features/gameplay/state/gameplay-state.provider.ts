import {
  PublicId,
  InternalId,
  GameFinder,
} from "@backend/common/data-access/games.repository";

import {
  RoundFinderAll,
  RoundResult,
} from "@backend/common/data-access/rounds.repository";

import { PlayerFinderAll } from "@backend/common/data-access/players.repository";
import { TeamsFinder } from "@backend/common/data-access/teams.repository";
import { GameAggregate, Round } from "./gameplay-state.types";

/**
 * Creates a provider that assembles the complete game state from different data sources
 *
 * @param getGameById - Function to retrieve game data using public ID
 * @param getRounds - Function to retrieve rounds for a game using internal ID
 * @returns Function that provides the complete game state for a given game ID
 */
export const gameplayStateProvider = (
  getGameById: GameFinder<PublicId>,
  getRounds: RoundFinderAll<InternalId>,
  getTeams: TeamsFinder<InternalId>,
  getPlayers: PlayerFinderAll<InternalId>,
) => {
  /**
   * Maps repository round data to domain Round type
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
   * Retrieves and assembles the complete game state for a given game
   *
   * @param gameId - Public identifier of the game
   * @returns Complete game state object or null if game not found
   */
  const getGameplayState = async (
    gameId: string,
  ): Promise<GameAggregate | null> => {
    const game = await getGameById(gameId);
    if (!game) return null;

    const roundsData = await getRounds(game.id);
    const rounds = roundsData.map(gameplayRoundMapper);
    const teams = await getTeams(game.id);
    const players = await getPlayers(game.id);

    const teamsWIthPlayers = teams.map((team) => {
      const playersForTeam = players.filter(
        (player) => player.teamId === team.id,
      );
      return {
        ...team,
        players: playersForTeam,
      };
    });

    return {
      id: game.id,
      public_id: game.public_id,
      status: game.status,
      game_format: game.game_format,
      rounds: rounds,
      teams: teamsWIthPlayers,
    };
  };

  return getGameplayState;
};

export type GameplayStateProvider = ReturnType<typeof gameplayStateProvider>;
