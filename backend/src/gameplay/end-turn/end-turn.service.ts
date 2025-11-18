/**
 * End Turn Service
 * Allows codebreakers to manually end their turn
 */

import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import { GameplayValidationError } from "../errors/gameplay.errors";

export type EndTurnService = (input: {
  gameId: string;
  roundNumber: number;
  userId: number;
  playerId: string;
}) => Promise<EndTurnResult>;

export type EndTurnResult =
  | { success: true; data: { turn: { id: string; teamName: string; status: string; completedAt: Date } } }
  | { success: false; error: string };

export type EndTurnDependencies = {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
};

export const createEndTurnService = (
  deps: EndTurnDependencies
): EndTurnService => {
  const { getGameState, gameplayHandler } = deps;

  return async (input) => {
    const { gameId, roundNumber, userId, playerId } = input;

    try {
      // Get current game state
      const gameState = await getGameState(gameId, userId, playerId);

      if (gameState.status !== "found") {
        return {
          success: false,
          error: `Game state error: ${gameState.status}`,
        };
      }

      const currentRound = gameState.data.currentRound;
      if (!currentRound) {
        return { success: false, error: "No active round" };
      }

      if (currentRound.number !== roundNumber) {
        return { success: false, error: "Round number mismatch" };
      }

      const currentTurn = currentRound.turns[currentRound.turns.length - 1];
      if (!currentTurn) {
        return { success: false, error: "No active turn" };
      }

      if (currentTurn.status === "COMPLETED") {
        return { success: false, error: "Turn already completed" };
      }

      // Verify the player is a codebreaker on the current turn's team
      const player = gameState.data.playerContext;
      if (!player) {
        return { success: false, error: "Player not found" };
      }

      if (player.role !== "CODEBREAKER") {
        return { success: false, error: "Only codebreakers can end turn" };
      }

      if (player.teamName !== currentTurn.teamName) {
        return { success: false, error: "Not your team's turn" };
      }

      // Get the turn's internal ID from the current round
      const turnWithInternalId = currentRound.turns.find(t => t.publicId === currentTurn.publicId);
      if (!turnWithInternalId || !turnWithInternalId._id) {
        return { success: false, error: "Turn not found" };
      }

      // Get the other team's ID to start their turn
      const currentTeamId = gameState.data.teams.find(t => t.teamName === currentTurn.teamName)?._id;
      const otherTeamId = gameState.data.teams.find(t => t._id !== currentTeamId)?._id;

      if (!otherTeamId) {
        return { success: false, error: "Could not find other team" };
      }

      // End the turn and start the next turn for the other team
      await gameplayHandler(async (ops) => {
        const gameState = await ops.getCurrentGameState(gameId, userId);

        // End current turn
        await ops.endTurn(gameState, turnWithInternalId._id);

        // Get updated state after ending turn
        const updatedGameState = await ops.getCurrentGameState(gameId, userId);

        // Start next turn for the other team
        await ops.startTurn(
          updatedGameState,
          updatedGameState.currentRound!._id,
          otherTeamId,
        );
      });

      return {
        success: true,
        data: {
          turn: {
            id: currentTurn.publicId,
            teamName: currentTurn.teamName,
            status: "COMPLETED",
            completedAt: new Date(),
          },
        },
      };
    } catch (error) {
      console.error("[EndTurn] Error:", error);

      if (error instanceof GameplayValidationError) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to end turn" };
    }
  };
};
