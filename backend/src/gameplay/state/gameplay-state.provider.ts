import {
  PublicId,
  InternalId,
  GameFinder,
} from "@backend/common/data-access/repositories/games.repository";

import {
  TeamsFinder,
  TeamResult,
} from "@backend/common/data-access/repositories/teams.repository";

import {
  PlayerFinderAll,
  PlayerResult,
  PlayerContextFinder,
} from "@backend/common/data-access/repositories/players.repository";

import {
  RoundFinder,
  RoundId,
  RoundFinderAll,
} from "@backend/common/data-access/repositories/rounds.repository";

import {
  CardsFinder,
  CardResult,
} from "@backend/common/data-access/repositories/cards.repository";

import { TurnsFinder } from "@backend/common/data-access/repositories/turns.repository";

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
 * @param getPlayersByGameId - Function to retrieve players for a GAME (not round)
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
  getPlayersByGameId: PlayerFinderAll<InternalId>,
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

    // Collect all game level state - players belong to GAMES not rounds!
    const [teams, allRounds, latestRound, players] = await Promise.all([
      getTeams(game._id),
      getAllRounds(game._id),
      getLatestRound(game._id),
      getPlayersByGameId(game._id), // ✅ Fixed: fetch by game ID, not round ID
    ]);

    // Get player context - handle case where no round exists yet
    const roundId = latestRound?._id || null;
    const playerContext = await getPlayerContext(game._id, userId, roundId);
    if (!playerContext) return null;

    // Transform teams data and populate with players immediately
    const teamsWithPlayers = teams.map((team: TeamResult) => ({
      _id: team._id,
      _gameId: team._gameId,
      teamName: team.teamName,
      players: players.filter(
        (player: PlayerResult) => player._teamId === team._id,
      ),
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

    // Collect round-specific state (cards and turns)
    const [cards, turns] = await Promise.all([
      getCardsByRoundId(latestRound._id),
      getTurnsByRoundId(latestRound._id),
    ]);

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
      teams: teamsWithPlayers, // ✅ Teams have players from game level
      currentRound: {
        _id: latestRound._id,
        number: latestRound.roundNumber,
        status: latestRound.status,
        players, // ✅ All game players available in round context too
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
