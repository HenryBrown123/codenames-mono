import { UnexpectedLobbyError } from "../errors/lobby.errors";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { LobbyOperations } from "../lobby-actions";
import type { LobbyStateProvider } from "../state/lobby-state.provider";
import { lobbyHelpers } from "../state/lobby-state.helpers";

export type PlayerResult = {
  _id: number;
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
};

export type ServiceDependencies = {
  lobbyHandler: TransactionalHandler<LobbyOperations>;
  getLobbyState: LobbyStateProvider;
};

export const modifyPlayersService = (dependencies: ServiceDependencies) => {
  const updatePlayers = async (
    publicGameId: string,
    playersToModify: PlayerUpdateData,
  ): Promise<ModifyPlayersServiceResult> => {
    if (!playersToModify.length) {
      return { modifiedPlayers: [] };
    }

    const lobby = await dependencies.getLobbyState(publicGameId, 0);
    if (!lobby) {
      throw new UnexpectedLobbyError(
        "Failed to modify players... game does not exist",
      );
    }

    if (lobby.status !== "LOBBY") {
      throw new UnexpectedLobbyError(
        `Cannot modify players in game state '${lobby.status}'`,
      );
    }

    // Validate team names if any are provided
    const teamNamesInRequest = playersToModify
      .map((p) => p.teamName)
      .filter((name): name is string => name !== undefined);

    const teamNameToIdMap = lobbyHelpers.getTeamNameToIdMap(lobby);

    if (teamNamesInRequest.length > 0) {
      const uniqueTeamNames = [...new Set(teamNamesInRequest)];
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
      // Build the repository request with proper team ID mapping
      const repositoryRequest = playersToModify.map((player) => {
        const updateData: {
          gameId: number;
          publicPlayerId: string;
          publicName?: string;
          teamId?: number;
        } = {
          gameId: lobby._id,
          publicPlayerId: player.playerId,
        };

        // Add optional fields only if they're provided
        if (player.playerName !== undefined) {
          updateData.publicName = player.playerName;
        }

        if (player.teamName !== undefined) {
          const teamId = teamNameToIdMap.get(player.teamName);
          if (teamId === undefined) {
            throw new UnexpectedLobbyError(
              `Team '${player.teamName}' not found in game`,
            );
          }
          updateData.teamId = teamId;
        }

        return updateData;
      });

      console.log(
        "Repository request:",
        JSON.stringify(repositoryRequest, null, 2),
      );

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
