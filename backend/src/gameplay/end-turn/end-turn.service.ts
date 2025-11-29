/**
 * End Turn Service
 * Allows codebreakers to manually end their turn
 */

import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import type { AppLogger } from "@backend/common/logging";
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

export const createEndTurnService = (logger: AppLogger) => (
  deps: EndTurnDependencies
): EndTurnService => {
  const { getGameState, gameplayHandler } = deps;

  return async (input) => {
    const { gameId, roundNumber, userId, playerId } = input;
    const log = logger.for({}).withMeta({ gameId, userId }).create();
    log.info(`endTurn called: ${JSON.stringify(input)}`);

    try {
      // Get current game state
      const gameState = await getGameState(gameId, userId, playerId);

      if (gameState.status !== "found") {
        log.warn(`endTurn failed: ${gameState.status}`);
        return {
          success: false,
          error: `Game state error: ${gameState.status}`,
        };
      }

      const currentRound = gameState.data.currentRound;
      if (!currentRound) {
        log.warn("endTurn failed: no active round");
        return { success: false, error: "No active round" };
      }

      if (currentRound.number !== roundNumber) {
        log.warn(`endTurn failed: round mismatch (requested=${roundNumber}, current=${currentRound.number})`);
        return { success: false, error: "Round number mismatch" };
      }

      const currentTurn = currentRound.turns[currentRound.turns.length - 1];
      if (!currentTurn) {
        log.warn("endTurn failed: no active turn");
        return { success: false, error: "No active turn" };
      }

      if (currentTurn.status === "COMPLETED") {
        log.warn("endTurn failed: turn already completed");
        return { success: false, error: "Turn already completed" };
      }

      // Verify the player is a codebreaker on the current turn's team
      const player = gameState.data.playerContext;
      if (!player) {
        log.warn("endTurn failed: player not found");
        return { success: false, error: "Player not found" };
      }

      if (player.role !== "CODEBREAKER") {
        log.warn("endTurn failed: only codebreakers can end turn");
        return { success: false, error: "Only codebreakers can end turn" };
      }

      // Find the full player object to check if they're an AI
      const fullPlayer = gameState.data.currentRound?.players.find(
        p => p.publicId === playerId
      );

      // For non-AI players, verify it's their team's turn
      // For AI players, skip this check as they're managed by the AI service
      if (!fullPlayer?.isAi && player.teamName !== currentTurn.teamName) {
        log.warn("endTurn failed: not your team's turn");
        return { success: false, error: "Not your team's turn" };
      }

      // Get the turn's internal ID from the current round
      const turnWithInternalId = currentRound.turns.find(t => t.publicId === currentTurn.publicId);
      if (!turnWithInternalId || !turnWithInternalId._id) {
        log.warn("endTurn failed: turn not found");
        return { success: false, error: "Turn not found" };
      }

      // Get the other team's ID to start their turn
      const currentTeamId = gameState.data.teams.find(t => t.teamName === currentTurn.teamName)?._id;
      const otherTeamId = gameState.data.teams.find(t => t._id !== currentTeamId)?._id;

      if (!otherTeamId) {
        log.warn("endTurn failed: could not find other team");
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

      log.info(`endTurn success: turnId=${currentTurn.publicId}`);
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
      log.error("Failed to end turn", { error: error instanceof Error ? error.message : String(error) });

      if (error instanceof GameplayValidationError) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Failed to end turn" };
    }
  };
};
