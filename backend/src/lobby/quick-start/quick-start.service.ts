import type { LobbyOperations } from "../lobby-actions";
import type { LobbyStateProvider } from "../state/lobby-state.provider";
import { lobbyHelpers } from "../state/lobby-state.helpers";
import { GAME_STATE } from "@codenames/shared/types";
import { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { DB } from "@backend/common/db/db.types";
import { Kysely } from "kysely";

// Import the services we need
import { roundCreationService } from "../new-round/new-round.service";
import { dealCardsService } from "../deal-cards/deal-cards.service";
import { startRoundService } from "../start-round/start-round.service";

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
  // Create the services we'll use
  const createRound = roundCreationService({
    getLobbyState: dependencies.getLobbyState,
    lobbyHandler: dependencies.lobbyHandler,
  });

  const dealCards = dealCardsService({
    getLobbyState: dependencies.getLobbyState,
    lobbyHandler: dependencies.lobbyHandler,
  });

  const startRound = startRoundService({
    getLobbyState: dependencies.getLobbyState,
    lobbyHandler: dependencies.lobbyHandler,
  });

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

    try {
      // Execute all operations in sequence
      // Step 1: Update game status to IN_PROGRESS
      const updatedGame = await dependencies.lobbyHandler(async (lobbyOps) => {
        return await lobbyOps.updateGameStatus(
          lobby._id,
          GAME_STATE.IN_PROGRESS,
        );
      });

      if (updatedGame.status !== GAME_STATE.IN_PROGRESS) {
        throw new Error(
          `Failed to start game. Expected status '${GAME_STATE.IN_PROGRESS}', got '${updatedGame.status}'`,
        );
      }

      // Step 2: Create a new round (includes role assignment)
      const roundResult = await createRound({
        gameId: publicGameId,
        userId: userId,
      });

      if (!roundResult.success) {
        throw new Error(`Failed to create round: ${roundResult.error.status}`);
      }

      // Step 3: Deal cards
      const dealResult = await dealCards({
        gameId: publicGameId,
        userId: userId,
      });

      if (!dealResult.success) {
        throw new Error(`Failed to deal cards: ${dealResult.error.status}`);
      }

      // Step 4: Start the round
      const startResult = await startRound({
        gameId: publicGameId,
        roundNumber: 1, // First round for quick start
        userId: userId,
      });

      if (!startResult.success) {
        throw new Error(`Failed to start round: ${startResult.error.status}`);
      }

      // Return success with actual IDs
      return {
        success: true,
        gameId: updatedGame._id,
        publicId: updatedGame.public_id,
        roundId: roundResult.data._id,
        turnId: 0, // TODO: Get turn ID from somewhere
        status: updatedGame.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to quick start game",
      };
    }
  };

  return quickStart;
};