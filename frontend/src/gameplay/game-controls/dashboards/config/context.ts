import { useMemo } from "react";
import { useGameDataRequired, useTurn } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { useAiStatus } from "@frontend/ai/api";
import { usePlayerSession } from "../../../game-data/providers/active-game-session-provider";
import type { TurnData, TurnPhase } from "@frontend/shared-types";
import { deriveVisibilityContext } from "./derive-visibility";

export interface VisibilityContext {
  // Player info
  role: "CODEMASTER" | "CODEBREAKER" | "SPECTATOR" | "NONE";
  teamName: string | undefined;
  playerName: string | undefined;

  // Turn state
  activeTeamName: string | undefined;
  isActiveTeam: boolean;
  hasClue: boolean;
  guessesRemaining: number;
  hasActiveTurn: boolean;
  activeTurn: TurnData | null;

  // Between-turns context
  lastCompletedTurn: TurnData | null;

  // Round state
  roundStatus: "SETUP" | "IN_PROGRESS" | "COMPLETED" | null;
  hasCards: boolean;
  hasRound: boolean;

  // Action state
  isActionLoading: boolean;

  // AI state
  aiAvailable: boolean;
  aiThinking: boolean;

  // Active phase from server
  active: TurnPhase | null;
  isAiSession: boolean;
}

/**
 * Derives visibility context from game state.
 * Single source of truth for all visibility decisions.
 */
export const useVisibilityContext = (): VisibilityContext => {
  const { gameData } = useGameDataRequired();
  const { activeTurn, historicTurns } = useTurn();
  const { actionState } = useGameActions();
  const { data: aiStatus } = useAiStatus(gameData.publicId);
  const { isAiClaimed } = usePlayerSession();

  return useMemo(
    () =>
      deriveVisibilityContext({
        gameData,
        activeTurn,
        historicTurns,
        actionStatus: actionState.status,
        aiStatus: aiStatus ?? null,
        isAiClaimed,
      }),
    [
      gameData.playerContext,
      gameData.publicId,
      gameData.currentRound,
      activeTurn,
      historicTurns,
      actionState.status,
      aiStatus,
      isAiClaimed,
    ],
  );
};
