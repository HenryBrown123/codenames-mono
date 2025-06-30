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
  PlayerFinderByPublicId,
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
 * Player context information for a specific player
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
 * Result types for player-specific game state lookup
 */
export type PlayerSpecificGameStateResult =
  | { status: "found"; data: GameAggregate }
  | { status: "game-not-found"; gameId: string }
  | { status: "player-not-found"; playerId: string }
  | { status: "player-not-in-game"; playerId: string; gameId: string }
  | { status: "user-not-authorized"; userId: number; playerId: string };

/**
 * Type representing the function returned by the provider
 */
export type PlayerSpecificStateProvider = (
  gameId: PublicId,
  playerId: string | null,
  userId: number,
) => Promise<PlayerSpecificGameStateResult>;

/**
 * Determines the role for a specific player based on current game state
 */
const determineRoleForPlayer = (
  player: PlayerResult,
  currentTurn: any | null,
): PlayerRole => {
  // If there's no current turn or round, player has no active role
  if (!currentTurn) return PLAYER_ROLE.NONE;

  // If the turn doesn't have a clue yet, codemaster should be active
  if (!currentTurn.clue) {
    return player._teamId === currentTurn._teamId ? PLAYER_ROLE.CODEMASTER : PLAYER_ROLE.NONE;
  }

  // If there is a clue, codebreakers should be active
  return player._teamId === currentTurn._teamId ? PLAYER_ROLE.CODEBREAKER : PLAYER_ROLE.NONE;
};

/**
 * Creates a provider that assembles game state for a specific player
 */
export const playerSpecificStateProvider = (
  getGameById: GameFinder<PublicId>,
  getTeams: TeamsFinder<InternalId>,
  getCardsByRoundId: CardsFinder<RoundId>,
  getTurnsByRoundId: TurnsFinder<RoundId>,
  getPlayersByGameId: PlayerFinderAll<InternalId>,
  getLatestRound: RoundFinder<InternalId>,
  getAllRounds: RoundFinderAll<InternalId>,
  findPlayerByPublicId: PlayerFinderByPublicId,
): PlayerSpecificStateProvider => {
  /**
   * Retrieves and assembles the complete game state for a specific player
   */
  const getPlayerSpecificGameState = async (
    gameId: PublicId,
    playerId: string | null,
    userId: number,
  ): Promise<PlayerSpecificGameStateResult> => {
    // Get the game first
    const game = await getGameById(gameId);
    if (!game) {
      return { status: "game-not-found", gameId };
    }

    let player: PlayerResult | null = null;
    
    // If playerId provided, find and validate the specific player
    if (playerId) {
      player = await findPlayerByPublicId(playerId);
      if (!player) {
        return { status: "player-not-found", playerId };
      }

      // Verify player belongs to this game
      if (player._gameId !== game._id) {
        return { status: "player-not-in-game", playerId, gameId };
      }

      // Verify user is authorized to view this player's context
      // In single-device mode, any user in the game can view any player context
      // In multi-device mode, user must own the specific player
      if (game.game_type === GAME_TYPE.MULTI_DEVICE && player._userId !== userId) {
        return { status: "user-not-authorized", userId, playerId };
      }
    }

    // For both cases (with/without playerId), verify the user is a player in the game
    const allGamePlayers = await getPlayersByGameId(game._id);
    const userIsPlayer = allGamePlayers.some(p => p._userId === userId);
    if (!userIsPlayer) {
      return { status: "user-not-authorized", userId, playerId: playerId || "none" };
    }

    // Collect all game level state
    const [teams, allRounds, latestRound, players] = await Promise.all([
      getTeams(game._id),
      getAllRounds(game._id),
      getLatestRound(game._id),
      getPlayersByGameId(game._id),
    ]);

    // Transform teams data and populate with players
    const teamsWithPlayers = teams.map((team: TeamResult) => ({
      _id: team._id,
      _gameId: team._gameId,
      teamName: team.teamName,
      players: players.filter(
        (p: PlayerResult) => p._teamId === team._id,
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
      const playerContext: PlayerContext = player ? {
        _id: player._id,
        publicId: player.publicId,
        _userId: player._userId,
        _gameId: player._gameId,
        _teamId: player._teamId,
        teamName: player.teamName,
        statusId: player.statusId,
        publicName: player.publicName,
        role: PLAYER_ROLE.NONE,
      } : {
        _id: 0,
        publicId: "none",
        _userId: userId,
        _gameId: game._id,
        _teamId: 0,
        teamName: "None",
        statusId: 0,
        publicName: "None",
        role: PLAYER_ROLE.NONE,
      };

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

    // Get current turn for role determination
    const currentTurn = turns.find((turn) => turn.status === "ACTIVE") || null;

    // Determine role for this specific player (or NONE if no player provided)
    const playerRole = player ? determineRoleForPlayer(player, currentTurn) : PLAYER_ROLE.NONE;

    const playerContext: PlayerContext = player ? {
      _id: player._id,
      publicId: player.publicId,
      _userId: player._userId,
      _gameId: player._gameId,
      _teamId: player._teamId,
      teamName: player.teamName,
      statusId: player.statusId,
      publicName: player.publicName,
      role: playerRole,
    } : {
      _id: 0,
      publicId: "none",
      _userId: userId,
      _gameId: game._id,
      _teamId: 0,
      teamName: "None",
      statusId: 0,
      publicName: "None",
      role: PLAYER_ROLE.NONE,
    };

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

  return getPlayerSpecificGameState;
};