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

import { PlayerRole, PLAYER_ROLE, GAME_TYPE } from "@codenames/shared/types";

import { GameAggregate } from "./gameplay-state.types";

/**
 * Player context information for the current user
 */
export type PlayerContext = {
  _id: number;
  publicId: string;
  _userId: number;
  _gameId: number;
  _teamId: number;
  teamName: string;
  statusId: number;
  publicName: string;
  role: PlayerRole;
  username?: string;
};

/**
 * Result types for game state lookup
 */
export type GameStateResult =
  | { status: "found"; data: GameAggregate }
  | { status: "game-not-found"; gameId: string }
  | { status: "user-not-player"; gameId: string; userId: number };

/**
 * Type representing the function returned by the provider
 */
export type GameplayStateProvider = (
  gameId: PublicId,
  userId: number,
) => Promise<GameStateResult>;

/**
 * Pure function to determine which role should be active for current turn
 */
const deriveActiveRoleForTurn = (currentTurn: any | null): PlayerRole => {
  if (!currentTurn) return PLAYER_ROLE.NONE;
  if (!currentTurn.clue) return PLAYER_ROLE.CODEMASTER;
  return PLAYER_ROLE.CODEBREAKER;
};

/**
 * Pure function to determine which team should be active for current turn
 */
const deriveActiveTeamForTurn = (currentTurn: any | null): number | null => {
  if (!currentTurn) return null;
  return currentTurn._teamId;
};

/**
 * Pure function to select the appropriate player from user's players
 */
const selectPlayerForRole = (
  userPlayers: PlayerResult[],
  targetRole: PlayerRole,
  targetTeamId?: number | null,
): PlayerResult | null => {
  if (userPlayers.length === 0) return null;

  // Filter by team if specified
  const eligiblePlayers = targetTeamId
    ? userPlayers.filter((p) => p._teamId === targetTeamId)
    : userPlayers;

  // Find first player with target role on the right team
  const playerWithRole = eligiblePlayers.find((p) => p.role === targetRole);

  // Fallback to first eligible player on the team, or any user player
  return playerWithRole || eligiblePlayers[0] || userPlayers[0];
};

/**
 * Determines the appropriate player context based on game mode and current turn
 */
const determinePlayerContext = (
  userPlayers: PlayerResult[],
  currentTurn: any,
  gameType: string,
): PlayerContext | null => {
  if (userPlayers.length === 0) return null;

  // Multi-device: Return user's specific player (validation will handle permissions)
  if (gameType === GAME_TYPE.MULTI_DEVICE) {
    return userPlayers[0]; // User should only have one player in multi-device
  }

  // Single-device: Return contextually appropriate player
  if (gameType === GAME_TYPE.SINGLE_DEVICE) {
    const activeRole = deriveActiveRoleForTurn(currentTurn);
    const activeTeamId = deriveActiveTeamForTurn(currentTurn);

    return selectPlayerForRole(userPlayers, activeRole, activeTeamId);
  }

  // Fallback
  return userPlayers[0];
};

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
   * @returns Complete game state object or error status
   */
  const getGameplayState = async (
    gameId: PublicId,
    userId: number,
  ): Promise<GameStateResult> => {
    const game = await getGameById(gameId);
    if (!game) return { status: "game-not-found", gameId };

    // Collect all game level state - players belong to GAMES not rounds!
    const [teams, allRounds, latestRound, players] = await Promise.all([
      getTeams(game._id),
      getAllRounds(game._id),
      getLatestRound(game._id),
      getPlayersByGameId(game._id),
    ]);

    // Get user's players for this game/round
    const roundId = latestRound?._id || null;
    const userPlayers = await getPlayerContext(game._id, userId, roundId);
    if (!userPlayers || userPlayers.length === 0) {
      return { status: "user-not-player", gameId, userId };
    }

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
      const playerContext = determinePlayerContext(
        userPlayers,
        null,
        game.game_type,
      );

      if (!playerContext) return { status: "user-not-player", gameId, userId };

      return {
        status: "found",
        data: {
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
        },
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

    // Get current turn for context determination
    const currentTurn = turns.find((turn) => turn.status === "ACTIVE") || null;

    // Determine appropriate player context based on game mode and current state
    const playerContext = determinePlayerContext(
      userPlayers,
      currentTurn,
      game.game_type,
    );

    if (!playerContext) return { status: "user-not-player", gameId, userId };

    return {
      status: "found",
      data: {
        _id: game._id,
        public_id: game.public_id,
        status: game.status,
        game_format: game.game_format,
        teams: teamsWithPlayers,
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
      },
    };
  };

  return getGameplayState;
};
