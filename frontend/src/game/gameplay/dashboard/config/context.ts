import { useMemo } from "react";
import { useGameDataRequired, useTurn } from "../../providers";
import { useGameActions } from "..";
import { useAiStatus } from "@frontend/ai/api";
import { usePlayerSession } from "../../providers/active-game-session-provider";
import type { TurnData, TurnPhase } from "@frontend/shared/types";
import { deriveVisibilityContext } from "./derive-visibility";

/**
 * Snapshot of every piece of state the dashboard visibility rules
 * need to decide which panels render and how they behave.
 *
 * Derived from raw `gameData`/`turn`/AI state by
 * {@link deriveVisibilityContext}; consumed by the rules in
 * `./rules.ts`. Centralising it here keeps every panel reading from
 * the same projection.
 */
export interface VisibilityContext {
  /** Player info */
  role: "CODEMASTER" | "CODEBREAKER" | "SPECTATOR" | "NONE";
  teamName: string | undefined;
  playerName: string | undefined;

  /** Turn state */
  activeTeamName: string | undefined;
  isActiveTeam: boolean;
  hasClue: boolean;
  guessesRemaining: number;
  hasActiveTurn: boolean;
  activeTurn: TurnData | null;

  /** Between-turns context */
  lastCompletedTurn: TurnData | null;

  /** Round state */
  roundStatus: "SETUP" | "IN_PROGRESS" | "COMPLETED" | null;
  hasCards: boolean;
  hasRound: boolean;

  /** Action state */
  isActionLoading: boolean;

  /** AI state */
  aiAvailable: boolean;
  aiThinking: boolean;

  /** Active phase from server */
  active: TurnPhase | null;
  isAiSession: boolean;
}

/**
 * React-flavoured wrapper around {@link deriveVisibilityContext}.
 *
 * Subscribes to the gameplay providers and AI status query, then
 * memoises the derived context so dependent panels re-render only
 * when one of the underlying inputs actually changes.
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
