import {
  PublicId,
  InternalId,
  GameFinder,
} from "@backend/common/data-access/games.repository";

import {
  TeamsFinder,
  TeamResult,
} from "@backend/common/data-access/teams.repository";

import {
  PlayersFinder,
  PlayerResult,
  PlayerContextFinder,
} from "@backend/common/data-access/players.repository";

import {
  RoundResult,
  RoundFinder,
  RoundId,
} from "@backend/common/data-access/rounds.repository";

import {
  CardsFinder,
  CardResult,
} from "@backend/common/data-access/cards.repository";

import {
  TurnsFinder,
  TurnResult,
} from "@backend/common/data-access/turns.repository";

import { PLAYER_ROLE, PlayerRole } from "@codenames/shared/types";

import { GameAggregate } from "./gameplay-state.types";

/**
 * Player context information for the current user
 */
export type PlayerContext = {
  _userId: number;
  _playerId: number;
  _teamId: number;
  username: string;
  playerName: string;
  teamName: string;
  role: PlayerRole;
};

/**
 * Type representing the function returned by the provider
 */
export type GameplayStateProvider = (
  gameId: string,
  userId: number,
) => Promise<GameAggregate | null>;

/**
 * Creates a provider that assembles the complete game state from different data sources
 *
 * @param getGameById - Function to retrieve game data using public ID
 * @param getTeams - Function to retrieve teams for a game
 * @param getCardsByRoundId - Function to retrieve cards for a round
 * @param getTurnsByRoundId - Function to retrieve turns for a round
 * @param getPlayersByRoundId - Function to retrieve players for a round
 * @param getLatestRound - Function to retrieve the latest round for a game
 * @param getPlayerContext - Function to retrieve player context info
 * @returns Function that provides the complete game state for a given game ID and user
 */
export const gameplayStateProvider = (
  getGameById: GameFinder<PublicId>,
  getTeams: TeamsFinder<InternalId>,
  getCardsByRoundId: CardsFinder<RoundId>,
  getTurnsByRoundId: TurnsFinder<RoundId>,
  getPlayersByRoundId: PlayersFinder<RoundId>,
  getLatestRound: RoundFinder<InternalId>,
  getPlayerContext: PlayerContextFinder,
): GameplayStateProvider => {
  /**
   * Retrieves and assembles the complete game state for a given game
   *
   * @param gameId - Public identifier of the game
   * @param userId - ID of the user requesting the state
   * @returns Complete game state object or null if game not found or user not authorized
   */
  const getGameplayState = async (
    gameId: string,
    userId: number,
  ): Promise<GameAggregate | null> => {
    const game = await getGameById(gameId);
    if (!game) return null;

    const latestRound = await getLatestRound(game._id);
    if (!latestRound) return null;

    // Get player context first to verify authorization
    const playerContext = await getPlayerContext(game._id, userId);
    if (!playerContext) {
      return null; // User not authorized for this game
    }

    // Now get the rest of the game data
    const [teams, cards, turns, players] = await Promise.all([
      getTeams(game._id),
      getCardsByRoundId(latestRound._id),
      getTurnsByRoundId(latestRound._id),
      getPlayersByRoundId(latestRound._id),
    ]);

    const teamsWithScores = teams.map((team) => ({
      ...team,
      score: 0,
    }));

    return {
      _id: game._id,
      public_id: game.public_id,
      status: game.status,
      game_format: game.game_format,
      teams: teamsWithScores,
      currentRound: {
        _id: latestRound._id,
        number: latestRound.roundNumber,
        status: latestRound.status,
        players,
        cards,
        turns,
      },
      playerContext,
      createdAt: game.created_at,
      updatedAt: game.updated_at,
    };
  };

  return getGameplayState;
};
