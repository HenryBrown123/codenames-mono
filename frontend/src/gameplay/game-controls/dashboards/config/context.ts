import { useMemo } from "react";
import { useGameDataRequired, useTurn } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { useAiStatus } from "@frontend/ai/api";
import { usePlayerSession } from "../../../game-data/providers/active-game-session-provider";
import type { TurnData, TurnPhase } from "@frontend/shared-types";

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

  return useMemo(() => {
    const role = (gameData.playerContext?.role ?? "NONE") as VisibilityContext["role"];
    const teamName = gameData.playerContext?.teamName;
    const playerName = gameData.playerContext?.playerName;
    const activeTeamName = activeTurn?.teamName;
    const roundStatus = (gameData.currentRound?.status ?? null) as VisibilityContext["roundStatus"];
    const hasCards = (gameData.currentRound?.cards?.length ?? 0) > 0;
    const hasRound = gameData.currentRound !== null && gameData.currentRound !== undefined;

    // Last completed turn for "what happened" context between turns
    const lastCompletedTurn =
      historicTurns.filter((t) => t.status === "COMPLETED").at(-1) ?? null;

    // Active phase — prefer the detailed turn query; fall back to the game
    // data's embedded turn entry in case the turn endpoint returns active:null
    // during the codemaster phase (before they have acted).
    const activeFromGameData =
      (gameData.currentRound?.turns ?? []).find((t) => t.status === "ACTIVE")?.active ?? null;
    const active = activeTurn?.active ?? activeFromGameData;

    // isAiClaimed is the authoritative signal: set when the user clicks PASS
    // on the AI overlay, cleared when a human handoff is accepted. Covers the
    // case where the backend returns active:null during the AI codemaster phase.
    const isAiSession = isAiClaimed || active?.isAi === true;

    const ctx = {
      role,
      teamName,
      playerName,
      activeTeamName,
      isActiveTeam: teamName !== undefined && teamName === activeTeamName,
      hasClue: activeTurn?.clue !== null && activeTurn?.clue !== undefined,
      guessesRemaining: activeTurn?.guessesRemaining ?? 0,
      hasActiveTurn: activeTurn?.status === "ACTIVE",
      activeTurn: activeTurn ?? null,
      lastCompletedTurn,
      roundStatus,
      hasCards,
      hasRound,
      isActionLoading: actionState.status === "loading",
      aiAvailable: aiStatus?.available ?? false,
      aiThinking: aiStatus?.thinking ?? false,
      active,
      isAiSession,
    };

    return ctx;
  }, [
    gameData.playerContext,
    gameData.publicId,
    gameData.currentRound,
    activeTurn,
    historicTurns,
    actionState.status,
    aiStatus,
    isAiClaimed,
  ]);
};
