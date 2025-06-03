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

export type PlayerUpdateData = {
  playerId: string;
  playerName?: string;
  teamName?: string;
}[];

export type ModifyPlayersServiceResult = {
  modifiedPlayers: PlayerResult[];
  gamePublicId: string;
};

export type ServiceDependencies = {
  lobbyHandler: TransactionalHandler<LobbyOperations, any>;
  getLobbyState: LobbyStateProvider;
};

export const modifyPlayersService = (dependencies: ServiceDependencies) => {
  const updatePlayers = async (
    publicGameId: string,
    playersToModify: PlayerUpdateData,
  ): Promise<ModifyPlayersServiceResult> => {
    if (!playersToModify.length) {
      return { modifiedPlayers: [], gamePublicId: publicGameId };
    }

    const lobby = await dependencies.getLobbyState(publicGameId, 0);
    if (!lobby) {
      throw new UnexpectedLobbyError(
        "Failed to modify players... game does not exist",
      );
    }

    if (lobby.status !== "LOBBY" || !lobby.userContext.canModifyGame) {
      throw new UnexpectedLobbyError(
        `Cannot modify players in game state '${lobby.status}'`,
      );
    }

    const teamNamesInRequest = playersToModify
      .map((p) => p.teamName)
      .filter((name): name is string => name !== undefined);

    if (teamNamesInRequest.length > 0) {
      const uniqueTeamNames = [...new Set(teamNamesInRequest)];
      const teamNameToIdMap = lobbyHelpers.getTeamNameToIdMap(lobby);
      const missingTeams = uniqueTeamNames.filter(
        (name) => !teamNameToIdMap.has(name),
      );

      if (missingTeams.length > 0) {
        throw new UnexpectedLobbyError(
          `Unknown team names: ${missingTeams.join(", ")}. Available teams: ${lobbyHelpers.getAvailableTeamNames(lobby).join(", ")}`,
        );
      }
    }

    return await dependencies.lobbyHandler(async (lobbyOps) => {
      const repositoryRequest = playersToModify.map((player) => {
        return {
          gameId: lobby._gameId,
          publicPlayerId: player.playerId,
          publicName: player.playerName,
        };
      });

      const modifiedPlayers = await lobbyOps.modifyPlayers(repositoryRequest);

      if (modifiedPlayers.length !== playersToModify.length) {
        throw new UnexpectedLobbyError(
          `Failed to modify all players. Expected ${playersToModify.length}, modified ${modifiedPlayers.length}`,
        );
      }

      return {
        modifiedPlayers: modifiedPlayers.map((player) => ({
          _id: player._id,
          publicId: player.publicId,
          playerName: player.publicName,
          username: undefined,
          teamName: player.teamName,
          statusId: player.statusId,
        })),
      };
    });
  };

  return updatePlayers;
};
