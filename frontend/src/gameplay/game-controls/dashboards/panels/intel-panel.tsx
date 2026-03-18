import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSection } from "../shared";
import { CodeWordInput } from "./codemaster-input";
import { useIntelState } from "./use-intel-state";
import styles from "./intel-panel.module.css";

// Animation constants matching lobby team symbol
const TEAM_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

/**
 * Intelligence panel showing current clue, guesses, and remaining attempts.
 * Supports navigation through turn history with left/right arrows.
 * When no clue exists, shows the codemaster input form (if codemaster) or awaiting message.
 */

export interface GuessDisplay {
  word: string;
  outcome: "CORRECT_TEAM_CARD" | "OTHER_TEAM_CARD" | "BYSTANDER_CARD" | "ASSASSIN_CARD";
}

export interface IntelPanelViewProps {
  teamName: string;
  hasClue: boolean;
  clueWord?: string;
  clueNumber?: number;
  guesses: GuessDisplay[];
  guessesRemaining: number;
  maxSlots?: number;
  // Navigation props
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  isHistorical?: boolean;
  // Codemaster input props (optional - for when no clue)
  isCodemasterGivingClue?: boolean;
  isLoading?: boolean;
  onSubmitClue?: (word: string, count: number) => void;
}

/**
 * Get team symbol and color based on team name.
 * Shared by header and guess outcome display.
 */
export const getTeamStyle = (
  teamName: string,
): { symbol: string; color: string; rotate: boolean } => {
  const teamLower = teamName.toLowerCase();
  const isRed = teamLower === "red" || teamLower.includes("red");
  const isBlue = teamLower === "blue" || teamLower.includes("blue");
  if (isRed) return { symbol: "□", color: "#ff3333", rotate: true };
  if (isBlue) return { symbol: "□", color: "#00ddff", rotate: false };
  return { symbol: "○", color: "#888888", rotate: false };
};

export const getOutcomeSymbol = (
  outcome: GuessDisplay["outcome"],
  currentTeam: string,
): { symbol: string; color: string; rotate: boolean } => {
  switch (outcome) {
    case "CORRECT_TEAM_CARD": {
      return getTeamStyle(currentTeam);
    }
    case "OTHER_TEAM_CARD": {
      // Other team's color - opposite of current
      const teamLower = currentTeam.toLowerCase();
      const isRed = teamLower === "red" || teamLower.includes("red");
      return isRed
        ? { symbol: "□", color: "#00ddff", rotate: false }
        : { symbol: "□", color: "#ff3333", rotate: true };
    }
    case "BYSTANDER_CARD":
      return { symbol: "○", color: "#888888", rotate: false };
    case "ASSASSIN_CARD":
      return { symbol: "☠", color: "#ffcc00", rotate: false };
    default:
      return { symbol: "?", color: "#888888", rotate: false };
  }
};

export const IntelPanelView: React.FC<IntelPanelViewProps> = ({
  teamName,
  hasClue,
  clueWord,
  clueNumber,
  guesses,
  guessesRemaining,
  maxSlots = 3,
  canGoBack = false,
  canGoForward = false,
  onGoBack,
  onGoForward,
  isHistorical = false,
  isCodemasterGivingClue = false,
  isLoading = false,
  onSubmitClue,
}) => {
  // Derive symbol styling from teamName
  const { symbol: teamSymbol, color: teamColor, rotate } = getTeamStyle(teamName);
  const teamSymbolStyle = rotate
    ? { display: "inline-block" as const, transform: "rotate(45deg)" }
    : undefined;

  return (
    <TerminalSection>
      <div className={styles.header}>
        <span className={styles.title}>INTEL</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={teamName}
            className={styles.teamSymbol}
            style={{ color: teamColor }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: TEAM_SWITCH_DURATION, ease: EASING }}
          >
            <span style={teamSymbolStyle}>{teamSymbol}</span>
          </motion.span>
        </AnimatePresence>
      </div>
      <div className={`${styles.intelDisplay} ${isHistorical ? styles.historical : ""}`}>
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
              <div className={styles.guessList}>
                {/* Real guesses */}
                {guesses.map((guess, index) => {
                  const { symbol, color, rotate } = getOutcomeSymbol(guess.outcome, teamName);
                  const symbolStyle = rotate
                    ? { display: "inline-block" as const, transform: "rotate(45deg)" }
                    : undefined;
                  return (
                    <div key={index} className={styles.guessRow}>
                      <span className={styles.guessWord}>{guess.word}</span>
                      <span className={styles.guessDots} />
                      <span className={styles.guessSymbol} style={{ color }}>
                        <span style={symbolStyle}>{symbol}</span>
                      </span>
                    </div>
                  );
                })}

                {/* Ghost rows — pad up to maxSlots so the box never shrinks */}
                {Array.from({ length: Math.max(0, maxSlots - guesses.length) }).map((_, i) => (
                  <div key={`ghost-${i}`} className={`${styles.guessRow} ${styles.guessRowGhost}`}>
                    <span className={styles.guessWord}>· · · · ·</span>
                    <span className={styles.guessDots} />
                    <span className={styles.guessSymbol}>·</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.navGroup}>
        <button
          className={styles.navArrow}
          onClick={onGoBack}
          disabled={!canGoBack}
          aria-label="Previous turn"
        >
          ◁
        </button>
        <button
          className={styles.navArrow}
          onClick={onGoForward}
          disabled={!canGoForward}
          aria-label="Next turn"
        >
          ▷
        </button>
      </div>
    </TerminalSection>
  );
};

export const IntelPanel: React.FC = () => {
  const intel = useIntelState();
  return <IntelPanelView {...intel} />;
};
