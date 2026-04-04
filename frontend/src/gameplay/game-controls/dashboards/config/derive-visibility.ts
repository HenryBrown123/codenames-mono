import type { GameData, TurnData, TurnPhase } from "@frontend/shared-types";
import type { VisibilityContext } from "./context";

/**
 * Inputs needed to derive visibility context.
 * Decoupled from React hooks for testability.
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
 * Pure function that derives visibility context from game state inputs.
 * Single source of truth for all visibility decisions.
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
