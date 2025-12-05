/**
 * Start Turn Service
 * Creates a new turn for the next team after previous turn has ended
 */

import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import type { AppLogger } from "@backend/common/logging";
import { GameplayValidationError } from "../errors/gameplay.errors";

export type StartTurnService = (input: {
  gameId: string;
  roundNumber: number;
  userId: number;
  playerId: string;
}) => Promise<StartTurnResult>;

export type StartTurnResult =
  | { success: true; data: { turn: { id: string; teamName: string; status: string } } }
  | { success: false; error: string };

export type StartTurnDependencies = {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
};

export const createStartTurnService =
  (logger: AppLogger) =>
  (deps: StartTurnDependencies): StartTurnService => {
    const { getGameState, gameplayHandler } = deps;

    return async (input) => {
      const { gameId, roundNumber, userId, playerId } = input;
      const log = logger.for({}).withMeta({ gameId, userId }).create();
      log.info(`startTurn called: ${JSON.stringify(input)}`);

      try {
        // Get current game state
        const gameState = await getGameState(gameId, userId, playerId);

        if (gameState.status !== "found") {
          log.warn(`startTurn failed: ${gameState.status}`);
          return {
            success: false,
            error: `Game state error: ${gameState.status}`,
          };
        }

        const currentRound = gameState.data.currentRound;
        if (!currentRound) {
          log.warn("startTurn failed: no active round");
          return { success: false, error: "No active round" };
        }

        if (currentRound.number !== roundNumber) {
          log.warn(`startTurn failed: round mismatch (requested=${roundNumber}, current=${currentRound.number})`);
          return { success: false, error: "Round number mismatch" };
        }

        if (currentRound.status !== "IN_PROGRESS") {
          log.warn("startTurn failed: round not in progress");
          return { success: false, error: "Round not in progress" };
        }

        // Check if there's already an active turn
        const activeTurn = currentRound.turns.find((t) => t.status === "ACTIVE");
        if (activeTurn) {
          log.warn("startTurn failed: active turn already exists");
          return { success: false, error: "Active turn already exists" };
        }

        // Get the last completed turn to determine next team
        const lastTurn = currentRound.turns[currentRound.turns.length - 1];
        if (!lastTurn) {
          log.warn("startTurn failed: no previous turn found");
          return { success: false, error: "No previous turn found" };
        }

        if (lastTurn.status !== "COMPLETED") {
          log.warn("startTurn failed: previous turn not completed");
          return { success: false, error: "Previous turn not completed" };
        }

        // Find the other team (switch teams)
        const lastTeamId = gameState.data.teams.find((t) => t.teamName === lastTurn.teamName)?._id;
        const nextTeam = gameState.data.teams.find((t) => t._id !== lastTeamId);

        if (!nextTeam) {
          log.warn("startTurn failed: could not find next team");
          return { success: false, error: "Could not find next team" };
        }

        // Create the new turn
        let newTurnPublicId: string = "";
        await gameplayHandler(async (ops) => {
          const freshGameState = await ops.getCurrentGameState(gameId, userId);
          const newTurn = await ops.startTurn(freshGameState, currentRound._id, nextTeam._id);
          newTurnPublicId = newTurn.publicId;
        });

        log.info(`startTurn success: new turn for team ${nextTeam.teamName}`);
        return {
          success: true,
          data: {
            turn: {
              id: newTurnPublicId,
              teamName: nextTeam.teamName,
              status: "ACTIVE",
            },
          },
        };
      } catch (error) {
        log.error("Failed to start turn", { error: error instanceof Error ? error.message : String(error) });

        if (error instanceof GameplayValidationError) {
          return { success: false, error: error.message };
        }

        return { success: false, error: "Failed to start turn" };
      }
    };
  };
