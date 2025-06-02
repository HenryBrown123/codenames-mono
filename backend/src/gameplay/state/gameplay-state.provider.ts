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
  PlayerFinderAll,
  PlayerResult,
  PlayerContextFinder,
} from "@backend/common/data-access/players.repository";

import {
  RoundFinder,
  RoundId,
  RoundFinderAll,
} from "@backend/common/data-access/rounds.repository";

import {
  CardsFinder,
  CardResult,
} from "@backend/common/data-access/cards.repository";

import { TurnsFinder } from "@backend/common/data-access/turns.repository";

import { PlayerRole } from "@codenames/shared/types";

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
  gameId: PublicId,
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
 * @param getAllRounds - Function to retrieve all rounds for a game
 * @param getPlayerContext - Function to retrieve player context info
 * @returns Function that provides the complete game state for a given game ID and user
 */
export const gameplayStateProvider = (
  getGameById: GameFinder<PublicId>,
  getTeams: TeamsFinder<InternalId>,
  getCardsByRoundId: CardsFinder<RoundId>,
  getTurnsByRoundId: TurnsFinder<RoundId>,
  getPlayersByRoundId: PlayerFinderAll<RoundId>,
  getLatestRound: RoundFinder<InternalId>,
  getAllRounds: RoundFinderAll<InternalId>,
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
    gameId: PublicId,
    userId: number,
  ): Promise<GameAggregate | null> => {
    const game = await getGameById(gameId);
    if (!game) return null;

    // Collect all game level state
    const [teams, allRounds, latestRound] = await Promise.all([
      getTeams(game._id),
      getAllRounds(game._id),
      getLatestRound(game._id),
    ]);

    // Get player context - handle case where no round exists yet
    const roundId = latestRound?._id || null;
    const playerContext = await getPlayerContext(game._id, userId, roundId);
    if (!playerContext) return null;

    // Transform teams data
    const teamsWithPlayers = teams.map((team: TeamResult) => ({
      _id: team._id,
      _gameId: team._gameId,
      teamName: team.teamName,
      players: [] as PlayerResult[], // Will be populated if round exists
    }));

    // Create historical rounds data
    const historicalRounds = allRounds
      .filter((round) => !latestRound || round._id !== latestRound._id)
      .map((round) => ({
        _id: round._id,
        number: round.roundNumber,
        status: round.status,
        _winningTeamId: round._winningTeamId,
        winningTeamName: round.winningTeamName,
        createdAt: round.createdAt,
      }));

    // Base state for when no current round exists
    if (!latestRound) {
      return {
        _id: game._id,
        public_id: game.public_id,
        status: game.status,
        game_format: game.game_format,
        teams: teamsWithPlayers,
        currentRound: null,
        historicalRounds,
        playerContext,
        createdAt: game.created_at,
        updatedAt: game.updated_at,
      };
    }

    // Collect all round level state
    const [cards, turns, players] = await Promise.all([
      getCardsByRoundId(latestRound._id),
      getTurnsByRoundId(latestRound._id),
      getPlayersByRoundId(latestRound._id),
    ]);

    // Add players to their respective teams
    const teamsWithPlayersPopulated = teamsWithPlayers.map((team) => ({
      ...team,
      players: players.filter(
        (player: PlayerResult) => player._teamId === team._id,
      ),
    }));

    const cardsMapped = cards.map((card: CardResult) => ({
      _id: card._id,
      _roundId: card._roundId,
      _teamId: card._teamId,
      teamName: card.teamName,
      word: card.word,
      cardType: card.cardType,
      selected: card.selected,
    }));

    return {
      _id: game._id,
      public_id: game.public_id,
      status: game.status,
      game_format: game.game_format,
      teams: teamsWithPlayersPopulated,
      currentRound: {
        _id: latestRound._id,
        number: latestRound.roundNumber,
        status: latestRound.status,
        players,
        cards: cardsMapped,
        turns,
        createdAt: latestRound.createdAt,
      },
      historicalRounds,
      playerContext,
      createdAt: game.created_at,
      updatedAt: game.updated_at,
    };
  };

  return getGameplayState;
};
