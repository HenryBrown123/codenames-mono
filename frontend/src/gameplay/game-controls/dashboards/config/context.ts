import { useMemo } from "react";
import { useGameDataRequired, useTurn } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";

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

  // Round state
  roundStatus: "SETUP" | "IN_PROGRESS" | "COMPLETED" | null;
  hasCards: boolean;
  hasRound: boolean;

  // Action state
  isActionLoading: boolean;
}

/**
 * Derives visibility context from game state.
 * Single source of truth for all visibility decisions.
 */
export const useVisibilityContext = (): VisibilityContext => {
  const { gameData } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { actionState } = useGameActions();

  return useMemo(() => {
    const role = (gameData.playerContext?.role ?? "NONE") as VisibilityContext["role"];
    const teamName = gameData.playerContext?.teamName;
    const playerName = gameData.playerContext?.playerName;
    const activeTeamName = activeTurn?.teamName;
    const roundStatus = (gameData.currentRound?.status ?? null) as VisibilityContext["roundStatus"];
    const hasCards = (gameData.currentRound?.cards?.length ?? 0) > 0;
    const hasRound = gameData.currentRound !== null && gameData.currentRound !== undefined;

    return {
      role,
      teamName,
      playerName,
      activeTeamName,
      isActiveTeam: teamName !== undefined && teamName === activeTeamName,
      hasClue: activeTurn?.clue !== null && activeTurn?.clue !== undefined,
      guessesRemaining: activeTurn?.guessesRemaining ?? 0,
      roundStatus,
      hasCards,
      hasRound,
      isActionLoading: actionState.status === "loading",
    };
  }, [gameData.playerContext, gameData.currentRound, activeTurn, actionState.status]);
};
