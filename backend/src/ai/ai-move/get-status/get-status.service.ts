import type { RunFinderByGame } from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { GameFinder } from "@backend/common/data-access/repositories/games.repository";

/**
 * AI status response
 */
export interface AiStatus {
  available: boolean; // Is it AI's turn and can trigger?
  thinking: boolean; // Is pipeline currently running?
  runId?: string; // Current run ID if thinking
}

/**
 * Dependencies required by the service
 */
export interface GetStatusServiceDeps {
  findRunningPipeline: RunFinderByGame;
  findGameByPublicId: GameFinder<string>;
  getGameState: GameplayStateProvider;
}

/**
 * Service result types
 */
export type GetStatusResult =
  | { status: "success"; aiStatus: AiStatus }
  | { status: "game-not-found"; gameId: string }
  | { status: "unauthorized"; gameId: string; userId: number };

/**
 * Creates the get status service
 */
export const getStatusService = (deps: GetStatusServiceDeps) =>
  async (gameId: string, userId: number): Promise<GetStatusResult> => {
    // Verify user has access to this game
    const gameState = await deps.getGameState(gameId, userId);

    if (gameState.status === "game-not-found") {
      return { status: "game-not-found", gameId };
    }

    if (gameState.status !== "found") {
      return { status: "unauthorized", gameId, userId };
    }

    // Get internal game ID
    const game = await deps.findGameByPublicId(gameId);
    if (!game) {
      return { status: "game-not-found", gameId };
    }

    // Check for running pipeline
    const runningPipeline = await deps.findRunningPipeline(game._id);

    if (runningPipeline) {
      return {
        status: "success",
        aiStatus: {
          available: false,
          thinking: true,
          runId: runningPipeline.id,
        },
      };
    }

    // Check if it's AI's turn
    if (!gameState.data.currentRound) {
      return {
        status: "success",
        aiStatus: {
          available: false,
          thinking: false,
        },
      };
    }

    const currentRound = gameState.data.currentRound;
    const allPlayers = gameState.data.teams.flatMap((team) => team.players);
    const currentTurn = currentRound.turns.length > 0
      ? currentRound.turns[currentRound.turns.length - 1]
      : null;

    if (!currentTurn) {
      return {
        status: "success",
        aiStatus: {
          available: false,
          thinking: false,
        },
      };
    }

    let aiCanAct = false;

    if (!currentTurn.clue) {
      const aiCodemaster = allPlayers.find(
        (p) => p.teamName === currentTurn.teamName && p.isAi && p.role === "CODEMASTER"
      );
      aiCanAct = !!aiCodemaster;
    } else if (currentTurn.guessesRemaining > 0) {
      const teamCodebreakers = allPlayers.filter(
        (p) => p.teamName === currentTurn.teamName && p.role === "CODEBREAKER"
      );
      const allCodebreakersAreAI = teamCodebreakers.length > 0 && teamCodebreakers.every((p) => p.isAi);
      aiCanAct = allCodebreakersAreAI;
    }

    return {
      status: "success",
      aiStatus: {
        available: aiCanAct,
        thinking: false,
      },
    };
  };
