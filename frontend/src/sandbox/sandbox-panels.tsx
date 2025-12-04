/**
 * Sandbox Panel Components
 *
 * These panels use the View components with mock data
 * instead of making API calls.
 */

import React from "react";
import { useTurn, useGameData } from "../gameplay/game-data/providers";
import { useGameActions } from "../gameplay/game-actions";
import {
  AIStatusPanelView,
  IntelPanelView,
  type GuessDisplay,
} from "../gameplay/game-controls/dashboards/panels";

/**
 * Sandbox version of AI Status Panel.
 * Shows mock AI status with trigger button.
 */
export const SandboxAIStatusPanel: React.FC = () => (
  <AIStatusPanelView
    isActive={true}
    showTriggerButton={true}
    onTrigger={() => console.log("Sandbox: AI triggered")}
  />
);

/**
 * Sandbox version of Intel Panel.
 * Reads from mock turn context to display clue and guesses.
 * Also supports codemaster input when appropriate.
 */
export const SandboxIntelPanel: React.FC = () => {
  const { activeTurn } = useTurn();
  const { gameData } = useGameData();
  const { giveClue, actionState } = useGameActions();

  const teamName = activeTurn?.teamName || "";
  const isRed = teamName.toLowerCase().includes("red");
  const teamSymbol = isRed ? "◇" : "□";
  const teamColor = isRed ? "#ff3333" : "#00ddff";

  // Determine if current player is codemaster on active team without a clue
  const playerRole = gameData?.playerContext?.role;
  const playerTeam = gameData?.playerContext?.teamName;
  const isCodemaster = playerRole === "CODEMASTER";
  const isActiveTeam = playerTeam === activeTurn?.teamName;
  const hasClue = !!activeTurn?.clue;
  const isCodemasterGivingClue = isCodemaster && isActiveTeam && !hasClue;

  const allGuesses: GuessDisplay[] = [
    ...(activeTurn?.prevGuesses || []).map((g) => ({
      word: g.cardWord,
      outcome: g.outcome as GuessDisplay["outcome"],
    })),
    ...(activeTurn?.lastGuess
      ? [
          {
            word: activeTurn.lastGuess.cardWord,
            outcome: activeTurn.lastGuess.outcome as GuessDisplay["outcome"],
          },
        ]
      : []),
  ];

  return (
    <IntelPanelView
      teamSymbol={teamSymbol}
      teamColor={teamColor}
      hasClue={hasClue}
      clueWord={activeTurn?.clue?.word}
      clueNumber={activeTurn?.clue?.number}
      guesses={allGuesses}
      guessesRemaining={activeTurn?.guessesRemaining ?? 0}
      isCodemasterGivingClue={isCodemasterGivingClue}
      isLoading={actionState.status === "loading"}
      onSubmitClue={giveClue}
    />
  );
};
