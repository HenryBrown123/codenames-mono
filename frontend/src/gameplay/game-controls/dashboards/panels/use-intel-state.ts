import { useState, useEffect } from "react";
import { useTurn, useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import type { GuessDisplay } from "./intel-panel";

/** Full intel state — used by CompactDashboard which needs codemaster fields too. */
export interface IntelState {
  teamName: string;
  guesses: GuessDisplay[];
  guessesRemaining: number;
  maxSlots: number;
  selectedIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  isHistorical: boolean;
  hasClue: boolean;
  clueWord?: string;
  clueNumber?: number;
  isCodemasterGivingClue: boolean;
  isLoading: boolean;
  onSubmitClue?: (word: string, count: number) => void;
}

/**
 * Shared intel navigation state.
 * Used by IntelPanel (stacked) and CompactDashboard.
 */
export const useIntelState = (): IntelState => {
  const { historicTurns } = useTurn();
  const { gameData } = useGameDataRequired();
  const { giveClue, actionState } = useGameActions();

  const [selectedIndex, setSelectedIndex] = useState(
    () => Math.max(0, historicTurns.length - 1)
  );

  // Auto-advance to latest turn when new turns arrive
  useEffect(() => {
    if (historicTurns.length > 0) {
      setSelectedIndex(historicTurns.length - 1);
    }
  }, [historicTurns.length]);

  const selectedTurn = historicTurns[selectedIndex];
  const isViewingLatest = selectedIndex === historicTurns.length - 1;

  const canGoBack = selectedIndex > 0;
  const canGoForward = selectedIndex < historicTurns.length - 1;
  const onGoBack = (): void => setSelectedIndex((i) => Math.max(0, i - 1));
  const onGoForward = (): void => setSelectedIndex((i) => Math.min(historicTurns.length - 1, i + 1));

  const teamName = selectedTurn?.teamName ?? "";
  const hasClue = !!selectedTurn?.clue;
  const isHistorical = !isViewingLatest || selectedTurn?.status === "COMPLETED";

  const playerRole = gameData.playerContext?.role;
  const playerTeam = gameData.playerContext?.teamName;

  const isCodemasterGivingClue =
    playerRole === "CODEMASTER" &&
    playerTeam === selectedTurn?.teamName &&
    !hasClue &&
    isViewingLatest &&
    selectedTurn?.status === "ACTIVE";

  const guesses: GuessDisplay[] = [
    ...(selectedTurn?.prevGuesses ?? []).map((g) => ({
      word: g.cardWord,
      outcome: g.outcome as GuessDisplay["outcome"],
    })),
    ...(selectedTurn?.lastGuess
      ? [
          {
            word: selectedTurn.lastGuess.cardWord,
            outcome: selectedTurn.lastGuess.outcome as GuessDisplay["outcome"],
          },
        ]
      : []),
  ];

  // Stable slot count — floor 3, only ever grows across all turns
  const maxSlots = historicTurns.reduce(
    (max, turn) => Math.max(max, turn.clue?.number ?? 0),
    3
  );

  return {
    teamName,
    guesses,
    guessesRemaining: selectedTurn?.guessesRemaining ?? 0,
    selectedIndex,
    canGoBack,
    canGoForward,
    onGoBack,
    onGoForward,
    isHistorical,
    maxSlots,
    hasClue,
    clueWord: hasClue ? selectedTurn!.clue!.word : undefined,
    clueNumber: hasClue ? selectedTurn!.clue!.number : undefined,
    isCodemasterGivingClue,
    isLoading: actionState.status === "loading",
    onSubmitClue: isCodemasterGivingClue ? giveClue : undefined,
  };
};
