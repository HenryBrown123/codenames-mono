import type { GameData, TurnData, TurnPhase } from "@frontend/shared/types";
import type { VisibilityContext } from "./context";

/**
 * Plain-data inputs required to derive a {@link VisibilityContext}.
 *
 * Decoupled from React hooks so the derivation can be exercised in
 * isolation by unit tests.
 */
export interface VisibilityInputs {
  gameData: GameData;
  activeTurn: TurnData | null;
  historicTurns: TurnData[];
  actionStatus: string;
  aiStatus: { available: boolean; thinking: boolean } | null;
  isAiClaimed: boolean;
}

/**
 * Derives the dashboard's visibility context from raw game state.
 *
 * Pure — no hooks, no side effects — so it can be unit-tested in
 * isolation and reused across the compact and stacked dashboards.
 * The dashboard reads the result rather than re-deriving the same
 * booleans inside each panel.
 */
export function deriveVisibilityContext(inputs: VisibilityInputs): VisibilityContext {
  const { gameData, activeTurn, historicTurns, actionStatus, aiStatus, isAiClaimed } = inputs;

  const role = (gameData.playerContext?.role ?? "NONE") as VisibilityContext["role"];
  const teamName = gameData.playerContext?.teamName;
  const playerName = gameData.playerContext?.playerName;
  const activeTeamName = activeTurn?.teamName;
  const roundStatus = (gameData.currentRound?.status ?? null) as VisibilityContext["roundStatus"];
  const hasCards = (gameData.currentRound?.cards?.length ?? 0) > 0;
  const hasRound = gameData.currentRound !== null && gameData.currentRound !== undefined;

  const lastCompletedTurn =
    historicTurns.filter((t) => t.status === "COMPLETED").at(-1) ?? null;

  const activeFromGameData =
    (gameData.currentRound?.turns ?? []).find((t) => t.status === "ACTIVE")?.active ?? null;
  const active = activeTurn?.active ?? activeFromGameData;

  const isAiSession = isAiClaimed || active?.isAi === true;

  return {
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
    isActionLoading: actionStatus === "loading",
    aiAvailable: aiStatus?.available ?? false,
    aiThinking: aiStatus?.thinking ?? false,
    active,
    isAiSession,
  };
}
