import { useState, useEffect } from "react";
import { useTurn, useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import type { GuessDisplay } from "./intel-panel";

/**
 * Shared intel navigation state.
 * Used by IntelPanel (stacked) and CompactDashboard.
 */
export const useIntelState = () => {
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
  const onGoBack = () => setSelectedIndex((i) => Math.max(0, i - 1));
  const onGoForward = () => setSelectedIndex((i) => Math.min(historicTurns.length - 1, i + 1));

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
    hasClue,
    clueWord: selectedTurn?.clue?.word,
    clueNumber: selectedTurn?.clue?.number,
    guesses,
    guessesRemaining: selectedTurn?.guessesRemaining ?? 0,
    canGoBack,
    canGoForward,
    onGoBack,
    onGoForward,
    isHistorical,
    isCodemasterGivingClue,
    isLoading: actionState.status === "loading",
    onSubmitClue: giveClue,
    maxSlots,
  };
};
