import { UnexpectedLobbyError } from "../errors/lobby.errors";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { LobbyOperations } from "../lobby-actions";
import type { LobbyStateProvider } from "../state/lobby-state.provider";
import { lobbyHelpers } from "../state/lobby-state.helpers";

export type PlayerResult = {
  publicId: string;
  playerName: string;
  username?: string;
  teamName: string;
  statusId: number;
};

export type PlayerAddData = {
  playerName: string;
  teamName: string;
}[];

export type AddPlayersServiceResult = {
  players: PlayerResult[];
  gamePublicId: string;
};

export type ServiceDependencies = {
  lobbyHandler: TransactionalHandler<LobbyOperations, any>;
  getLobbyState: LobbyStateProvider;
};

export const addPlayersService = (dependencies: ServiceDependencies) => {
  const addPlayers = async (
    publicGameId: string,
    userId: number,
    playersToAdd: PlayerAddData,
  ): Promise<AddPlayersServiceResult> => {
    if (!playersToAdd.length) {
      return { players: [], gamePublicId: publicGameId };
    }

    const lobby = await dependencies.getLobbyState(publicGameId, userId);
    if (!lobby) {
      throw new UnexpectedLobbyError(
        `Game with public ID ${publicGameId} not found`,
      );
    }

    if (lobby.status !== "LOBBY") {
      throw new UnexpectedLobbyError(
        `Cannot add players to game in '${lobby.status}' state`,
      );
    }

    if (lobby.gameType === "MULTI_DEVICE" && playersToAdd.length > 1) {
      throw new UnexpectedLobbyError(
        "Multi-device games only allow adding one player at a time",
      );
    }

    const uniqueTeamNames = [...new Set(playersToAdd.map((p) => p.teamName))];
    const teamNameToIdMap = lobbyHelpers.getTeamNameToIdMap(lobby);
    const missingTeams = uniqueTeamNames.filter(
      (name) => !teamNameToIdMap.has(name),
    );

    if (missingTeams.length > 0) {
      throw new UnexpectedLobbyError(
        `Unknown team names: ${missingTeams.join(", ")}. Available teams: ${lobbyHelpers.getAvailableTeamNames(lobby).join(", ")}`,
      );
    }

    return await dependencies.lobbyHandler(async (lobbyOps) => {
      const repositoryRequest = playersToAdd.map((player) => ({
        userId,
        gameId: lobby._gameId,
        teamId: teamNameToIdMap.get(player.teamName)!,
        publicName: player.playerName,
        statusId: 1,
      }));

      const newPlayers = await lobbyOps.addPlayers(repositoryRequest);

      if (newPlayers.length !== playersToAdd.length) {
        throw new UnexpectedLobbyError(
          `Failed to add all players. Expected ${playersToAdd.length}, created ${newPlayers.length}`,
        );
      }

      return {
        players: newPlayers.map((player) => ({
          publicId: player.publicId,
          playerName: player.publicName,
          username: undefined,
          teamName: player.teamName,
          statusId: player.statusId,
        })),
        gamePublicId: lobby.publicId,
      };
    });
  };

  return addPlayers;
};
