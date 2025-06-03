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

import { LobbyAggregate } from "./lobby-state.types";

export type LobbyStateProvider = (
  gameId: PublicId,
  userId: number,
) => Promise<LobbyAggregate | null>;

export const lobbyStateProvider = (
  getGameById: GameFinder<PublicId>,
  getTeams: TeamsFinder<InternalId>,
  getPlayersByGameId: PlayerFinderAll<InternalId>,
): LobbyStateProvider => {
  const getLobbyState = async (
    gameId: PublicId,
    userId: number,
  ): Promise<LobbyAggregate | null> => {
    const game = await getGameById(gameId);
    if (!game) return null;

    const [teams, players] = await Promise.all([
      getTeams(game._id),
      getPlayersByGameId(game._id),
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

    return {
      _gameId: game._id,
      publicId: game.public_id,
      status: game.status,
      gameType: game.game_type,
      teams: teamsWithPlayers,
      userContext: {
        _userId: userId,
        canModifyGame,
      },
      createdAt: game.created_at,
      updatedAt: game.updated_at,
    };
  };

  return getLobbyState;
};
