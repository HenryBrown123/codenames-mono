import type { LobbyOperations } from "../lobby-actions";
import type { LobbyStateProvider } from "../state/lobby-state.provider";
import { lobbyHelpers } from "../state/lobby-state.helpers";
import { GAME_STATE } from "@codenames/shared/types";
import { TransactionalHandler } from "@backend/common/data-access/transaction-handler";

export type GameStartSuccess = {
  _id: number;
  success: true;
  publicId: string;
  status: string;
};

export type GameStartError = {
  success: false;
  error: string;
};

export type GameStartResult = GameStartSuccess | GameStartError;

export type ServiceDependencies = {
  lobbyHandler: TransactionalHandler<LobbyOperations>;
  getLobbyState: LobbyStateProvider;
};

export const startGameService = (dependencies: ServiceDependencies) => {
  const startGame = async (publicGameId: string): Promise<GameStartResult> => {
    const lobby = await dependencies.getLobbyState(publicGameId, 0);
    if (!lobby) {
      return {
        success: false,
        error: `Game with public ID ${publicGameId} not found`,
      };
    }

    const totalPlayers = lobbyHelpers.getTotalPlayerCount(lobby);
    const teamCounts = lobbyHelpers.getTeamPlayerCounts(lobby);

    if (lobby.status !== "LOBBY") {
      return {
        success: false,
        error: `Cannot start game in '${lobby.status}' state`,
      };
    }

    if (totalPlayers < 4) {
      return {
        success: false,
        error: "Cannot start game with less than 4 players",
      };
    }

    if (teamCounts.length < 2) {
      return {
        success: false,
        error: "Cannot start game with less than 2 teams",
      };
    }

    if (teamCounts.some((count) => count < 2)) {
      return {
        success: false,
        error: "Each team must have at least 2 players",
      };
    }

    return await dependencies.lobbyHandler(async (lobbyOps) => {
      const updatedGame = await lobbyOps.updateGameStatus(
        lobby._gameId,
        GAME_STATE.IN_PROGRESS,
      );

      if (updatedGame.status !== GAME_STATE.IN_PROGRESS) {
        throw new Error(
          `Failed to start game. Expected status '${GAME_STATE.IN_PROGRESS}', got '${updatedGame.status}'`,
        );
      }

      return {
        success: true,
        _id: updatedGame._id,
        publicId: updatedGame.public_id,
        status: updatedGame.status,
      };
    });
  };

  return startGame;
};
