import React from "react";
import { useTurn, useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { TerminalSection, TerminalCommand } from "../shared";
import { CodeWordInput } from "./codemaster-input";
import styles from "./intel-panel.module.css";

/**
 * Intelligence panel showing current clue, guesses, and remaining attempts.
 * When no clue exists, shows the codemaster input form (if codemaster) or awaiting message.
 */

export interface GuessDisplay {
  word: string;
  outcome: "CORRECT_TEAM_CARD" | "OTHER_TEAM_CARD" | "BYSTANDER_CARD" | "ASSASSIN_CARD";
}

export interface IntelPanelViewProps {
  teamSymbol: string;
  teamColor: string;
  hasClue: boolean;
  clueWord?: string;
  clueNumber?: number;
  guesses: GuessDisplay[];
  guessesRemaining: number;
  // Codemaster input props (optional - for when no clue)
  isCodemasterGivingClue?: boolean;
  isLoading?: boolean;
  onSubmitClue?: (word: string, count: number) => void;
}

const getOutcomeSymbol = (outcome: GuessDisplay["outcome"]): { symbol: string; color: string } => {
  switch (outcome) {
    case "CORRECT_TEAM_CARD":
      return { symbol: "◆", color: "var(--color-primary, #00ff88)" };
    case "OTHER_TEAM_CARD":
      return { symbol: "◆", color: "#ff4444" };
    case "BYSTANDER_CARD":
      return { symbol: "○", color: "#888888" };
    case "ASSASSIN_CARD":
      return { symbol: "△", color: "#ffcc00" };
    default:
      return { symbol: "?", color: "#888888" };
  }
};

export const IntelPanelView: React.FC<IntelPanelViewProps> = ({
  teamSymbol,
  teamColor,
  hasClue,
  clueWord,
  clueNumber,
  guesses,
  guessesRemaining,
  isCodemasterGivingClue = false,
  isLoading = false,
  onSubmitClue,
}) => (
  <TerminalSection>
    <TerminalCommand>
      ACTIVE INTEL{" "}
      <span className={styles.teamSymbol} style={{ color: teamColor }}>
        {teamSymbol}
      </span>
    </TerminalCommand>
    <div className={styles.intelDisplay}>
      {!hasClue ? (
        isCodemasterGivingClue && onSubmitClue ? (
          <CodeWordInput
            codeWord=""
            numberOfCards={null}
            isEditable={true}
            isLoading={isLoading}
            onSubmit={onSubmitClue}
          />
        ) : (
          <div className={styles.awaitingIntel}>AWAITING INTEL</div>
        )
      ) : (
        <>
          <div className={styles.clueSection}>
            <span className={styles.clueWord}>"{clueWord}"</span>
            <span className={styles.clueNumber}>: {clueNumber}</span>
          </div>

          <div className={styles.guessesDivider} />

          <div className={styles.guessesSection}>
            {guesses.length === 0 ? (
              <div className={styles.awaitingIntel}>AWAITING OPERATIVES</div>
            ) : (
              <div className={styles.guessList}>
                {guesses.map((guess, index) => {
                  const { symbol, color } = getOutcomeSymbol(guess.outcome);
                  return (
                    <div key={index} className={styles.guessRow}>
                      <span className={styles.guessWord}>{guess.word}</span>
                      <span className={styles.guessDots} />
                      <span className={styles.guessSymbol} style={{ color }}>
                        {symbol}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.remainingSection}>
            <span className={styles.remainingLabel}>Remaining:</span>
            <span className={styles.remainingCount}>{guessesRemaining}</span>
          </div>
        </>
      )}
    </div>
  </TerminalSection>
);

export const IntelPanel: React.FC = () => {
  const { activeTurn } = useTurn();
  const { gameData } = useGameDataRequired();
  const { giveClue, actionState } = useGameActions();

  const teamName = activeTurn?.teamName || "";
  const isRed = teamName.toLowerCase().includes("red");
  const teamSymbol = isRed ? "◇" : "□";
  const teamColor = isRed ? "#ff3333" : "#00ddff";

  // Determine if current player is codemaster on active team without a clue
  const playerRole = gameData.playerContext?.role;
  const playerTeam = gameData.playerContext?.teamName;
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
