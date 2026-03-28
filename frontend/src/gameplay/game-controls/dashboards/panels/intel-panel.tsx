import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSection, AwaitingLabel, carouselVariants, CAROUSEL_TRANSITION, useCarouselSwipe } from "../shared";
import { useIntelState } from "./use-intel-state";
import { TeamSymbolIcon } from "../../../../shared/team-symbol-icon";
import { CircleButton } from "@frontend/gameplay/shared/components";
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

/** Shared props across all intel panel variants. */
interface IntelPanelBaseProps {
  teamName: string;
  guesses: GuessDisplay[];
  guessesRemaining: number;
  maxSlots?: number;
  selectedIndex: number;
  // Navigation
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  isHistorical?: boolean;
}

/** Clue is visible — show the word, number, and guesses. */
interface IntelPanelWithClueProps extends IntelPanelBaseProps {
  hasClue: true;
  clueWord: string;
  clueNumber: number;
}

/** Waiting for a clue — show "AWAITING INTEL". */
interface IntelPanelAwaitingProps extends IntelPanelBaseProps {
  hasClue: false;
}

export type IntelPanelViewProps =
  | IntelPanelWithClueProps
  | IntelPanelAwaitingProps;

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

export const IntelPanelView: React.FC<IntelPanelViewProps> = (props) => {
  const {
    teamName,
    hasClue,
    guesses,
    guessesRemaining,
    maxSlots = 3,
    selectedIndex,
    canGoBack = false,
    canGoForward = false,
    onGoBack,
    onGoForward,
    isHistorical = false,
  } = props;

  const { swipeDirection, handleDragEnd, handleGoBack, handleGoForward } = useCarouselSwipe({
    canGoBack,
    canGoForward,
    onGoBack: onGoBack ?? (() => {}),
    onGoForward: onGoForward ?? (() => {}),
  });

  // Derive symbol styling from teamName
  const { symbol: teamSymbol, color: teamColor, rotate } = getTeamStyle(teamName);

  return (
    <TerminalSection>
      <div className={styles.header}>
        <span className={styles.title}>INTEL</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={teamName}
            className={styles.teamSymbol}
            style={{ "--symbol-color": teamColor } as React.CSSProperties}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: TEAM_SWITCH_DURATION, ease: EASING }}
          >
            <TeamSymbolIcon symbol={teamSymbol} rotate={rotate} />
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div
        className={styles.swipeZone}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "pan-y" }}
      >
        <AnimatePresence mode="wait" initial={false} custom={swipeDirection}>
          <motion.div
            key={selectedIndex}
            custom={swipeDirection}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={CAROUSEL_TRANSITION}
          >
            <div className={`${styles.intelDisplay} ${isHistorical ? styles.historical : ""}`}>
              {!hasClue ? (
                <div className={styles.awaitingCenter}><AwaitingLabel>INTEL REQUIRED</AwaitingLabel></div>
              ) : (
                <>
                  <div className={styles.clueSection}>
                    <span className={styles.clueWord}>"{props.clueWord}"</span>
                    <span className={styles.clueNumber}>: {props.clueNumber}</span>
                  </div>

                  <div className={styles.guessesDivider} />

                  <div className={styles.guessesSection}>
                    <div className={styles.guessList}>
                      {guesses.map((guess, index) => {
                        const { symbol, color, rotate } = getOutcomeSymbol(guess.outcome, teamName);
                        return (
                          <div key={index} className={styles.guessRow}>
                            <span className={styles.guessWord}>{guess.word}</span>
                            <span className={styles.guessDots} />
                            <span className={styles.guessSymbol}>
                              <TeamSymbolIcon symbol={symbol} rotate={rotate} color={color} />
                            </span>
                          </div>
                        );
                      })}

                      {guesses.length > 0 && Array.from({ length: Math.max(0, maxSlots - guesses.length) }).map((_, i) => (
                        <div key={`ghost-${i}`} className={`${styles.guessRow} ${styles.guessRowGhost}`}>
                          <span className={styles.guessWord}>· · · · ·</span>
                          <span className={styles.guessDots} />
                          <span className={styles.guessSymbol}>·</span>
                        </div>
                      ))}

                      {guesses.length === 0 && (
                        <AwaitingLabel>AWAITING INPUT</AwaitingLabel>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className={styles.navGroup}>
        <CircleButton onClick={handleGoBack} disabled={!canGoBack} aria-label="Previous turn">{"<"}</CircleButton>
        <CircleButton onClick={handleGoForward} disabled={!canGoForward} aria-label="Next turn">{">"}</CircleButton>
      </div>
    </TerminalSection>
  );
};

export const IntelPanel: React.FC = () => {
  const intel = useIntelState();

  const viewProps: IntelPanelViewProps = intel.hasClue
    ? {
        ...intel,
        hasClue: true as const,
        clueWord: intel.clueWord!,
        clueNumber: intel.clueNumber!,
      }
    : {
        ...intel,
        hasClue: false as const,
      };

  return <IntelPanelView {...viewProps} />;
};
