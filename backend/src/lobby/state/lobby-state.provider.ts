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
} from "@backend/common/data-access/repositories/players.repository";

import {
  RoundFinderAll,
} from "@backend/common/data-access/repositories/rounds.repository";

import { LobbyAggregate } from "./lobby-state.types";

export type LobbyStateProvider = (
  gameId: PublicId,
  userId: number,
) => Promise<LobbyAggregate | null>;

export const lobbyStateProvider = (
  getGameById: GameFinder<PublicId>,
  getTeams: TeamsFinder<InternalId>,
  getPlayersByGameId: PlayerFinderAll<InternalId>,
  getRoundsByGameId: RoundFinderAll<InternalId>,
): LobbyStateProvider => {
  const getLobbyState = async (
    gameId: PublicId,
    userId: number,
  ): Promise<LobbyAggregate | null> => {
    const game = await getGameById(gameId);
    if (!game) return null;

    const [teams, players, rounds] = await Promise.all([
      getTeams(game._id),
      getPlayersByGameId(game._id),
      getRoundsByGameId(game._id),
    ]);

    const teamsWithPlayers = teams.map((team: TeamResult) => ({
      _id: team._id,
      _gameId: team._gameId,
      teamName: team.teamName,
      players: players.filter(
        (player: PlayerResult) => player._teamId === team._id,
      ),
    }));

    const userPlayer = players.find((player) => player._userId === userId);
    const canModifyGame = !!userPlayer;
    
    // Create player context for validation compatibility
    const playerContext = userPlayer ? {
      _userId: userPlayer._userId,
      _id: userPlayer._id,
      _teamId: userPlayer._teamId,
      username: userPlayer.username,
      publicName: userPlayer.publicName,
      teamName: userPlayer.teamName,
      role: userPlayer.role,
    } : {
      _userId: userId,
      _id: 0,
      _teamId: 0,
      username: null,
      publicName: "Guest",
      teamName: "No Team",
      role: "NONE" as any,
    };

    // Find current round (latest incomplete round) and historical rounds
    const sortedRounds = rounds.sort((a, b) => b.roundNumber - a.roundNumber);
    const currentRound = sortedRounds.find(r => r.status !== "COMPLETED") || null;
    const historicalRounds = sortedRounds.filter(r => r.status === "COMPLETED");

    return {
      _id: game._id,
      public_id: game.public_id,
      status: game.status,
      game_format: game.game_format,
      gameType: game.game_type,
      teams: teamsWithPlayers,
      currentRound: currentRound ? {
        _id: currentRound._id,
        number: currentRound.roundNumber,
        status: currentRound.status,
        cards: [], // Cards populated when needed
        turns: [], // Turns populated when needed  
        players: [], // Round players populated when needed
        createdAt: currentRound.createdAt,
      } : null,
      historicalRounds: historicalRounds.map(r => ({
        _id: r._id,
        number: r.roundNumber,
        status: r.status,
        _winningTeamId: r._winningTeamId,
        winningTeamName: r.winningTeamName,
        createdAt: r.createdAt,
      })),
      userContext: {
        _userId: userId,
        canModifyGame,
      },
      playerContext,
      createdAt: game.created_at,
      updatedAt: game.updated_at,
    };
  };

  return getLobbyState;
};
