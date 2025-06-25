import type { LobbyOperations } from "../lobby-actions";
import type { LobbyStateProvider } from "../state/lobby-state.provider";
import { lobbyHelpers } from "../state/lobby-state.helpers";
import { GAME_STATE } from "@codenames/shared/types";
import { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import { gameplayState } from "../../gameplay/state";
import type { GameplayStateProvider } from "../../gameplay/state/gameplay-state.provider";
import type { DB } from "@backend/common/db/db.types";
import { Kysely } from "kysely";

export type QuickStartSuccess = {
  success: true;
  gameId: number;
  publicId: string;
  roundId: number;
  turnId: number;
  status: string;
};

export type QuickStartError = {
  success: false;
  error: string;
};

export type QuickStartResult = QuickStartSuccess | QuickStartError;

export type ServiceDependencies = {
  lobbyHandler: TransactionalHandler<LobbyOperations>;
  getLobbyState: LobbyStateProvider;
  db: Kysely<DB>;
};

export const quickStartService = (dependencies: ServiceDependencies) => {
  const quickStart = async (
    publicGameId: string,
    userId: number
  ): Promise<QuickStartResult> => {
    // Get initial lobby state
    const lobby = await dependencies.getLobbyState(publicGameId, userId);
    if (!lobby) {
      return {
        success: false,
        error: `Game with public ID ${publicGameId} not found`,
      };
    }

    // Validate lobby can start
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

    // Execute all operations in a single transaction
    return await dependencies.lobbyHandler(async (lobbyOps) => {
      // 1. Update game status to IN_PROGRESS
      const updatedGame = await lobbyOps.updateGameStatus(
        lobby._id,
        GAME_STATE.IN_PROGRESS,
      );

      if (updatedGame.status !== GAME_STATE.IN_PROGRESS) {
        throw new Error(
          `Failed to start game. Expected status '${GAME_STATE.IN_PROGRESS}', got '${updatedGame.status}'`,
        );
      }

      // TODO: Implement full workflow with proper validation
      // For now, just update game status as a basic quick-start
      // Full implementation would:
      // - Create round using validated game state
      // - Deal cards using validated game state  
      // - Assign roles using validated game state
      // - Start round using validated game state

      // Return success with basic info
      return {
        success: true,
        gameId: updatedGame._id,
        publicId: updatedGame.public_id,
        roundId: 0, // Placeholder - would be actual round ID
        turnId: 0, // Placeholder - would be actual turn ID
        status: updatedGame.status,
      };
    });
  };

  return quickStart;
};