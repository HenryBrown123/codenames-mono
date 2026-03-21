import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { useIntelState } from "../dashboards/panels/use-intel-state";
import { useGameDataRequired } from "../../game-data/providers";
import { useAiStatus, useTriggerAiMove } from "../../../ai/api";
import { getTeamStyle, getOutcomeSymbol } from "../dashboards/panels/intel-panel";
import styles from "./compact-dashboard.module.css";

const TEAM_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

interface CompactDashboardProps {
  onOpenClueInput: () => void;
}

/**
 * Compact vertical dashboard for constrained viewports.
 *
 * Four sections stacked vertically:
 * - Header: INTEL label + team symbol + score (round over) + nav arrows
 * - Intel box: clue + guesses
 * - AI section: trigger button or thinking status (only when AI active)
 * - Footer: single full-width primary action button
 *
 * Used by DesktopScene (portrait), WindowedScene, and MobileScene.
 */
export const CompactDashboard: React.FC<CompactDashboardProps> = ({ onOpenClueInput }) => {
  const s = useDashboardState();
  const intel = useIntelState();

  const { gameData } = useGameDataRequired();
  const { data: aiStatus } = useAiStatus(gameData.publicId);
  const triggerAi = useTriggerAiMove(gameData.publicId);

  const isAiThinking = (aiStatus?.thinking || triggerAi.isPending) ?? false;
  const canTriggerAi = (aiStatus?.available && !isAiThinking) ?? false;

  const ghostCount = Math.max(0, intel.maxSlots - intel.guesses.length);
  const { symbol, color, rotate } = getTeamStyle(intel.teamName);
  const symbolStyle = rotate
    ? { display: "inline-block" as const, transform: "rotate(45deg)" }
    : undefined;

  // Single primary action — disabled (not hidden) when AI is thinking
  const primaryButton = (() => {
    if (s.isCodemasterGivingClue)
      return (
        <button
          className={styles.primaryBtn}
          onClick={onOpenClueInput}
          disabled={isAiThinking}
        >
          TRANSMIT
        </button>
      );
    if (s.isInLobby && s.lobbyAction)
      return (
        <button
          className={styles.primaryBtn}
          onClick={s.lobbyAction.handler}
          disabled={s.isLoading}
        >
          {s.isLoading ? "..." : s.lobbyAction.label}
        </button>
      );
    if (s.isCodebreakerGuessing)
      return (
        <button
          className={styles.primaryBtn}
          onClick={s.endTurn}
          disabled={s.isLoading || isAiThinking}
        >
          {s.isLoading ? "..." : "END TURN"}
        </button>
      );
    if (s.canStartNextTurn)
      return (
        <button
          className={styles.primaryBtn}
          onClick={s.startNextTurn.handler}
          disabled={s.startNextTurn.isPending}
        >
          {s.startNextTurn.isPending ? "..." : "NEXT TURN"}
        </button>
      );
    if (s.isRoundComplete && s.gameOverData)
      return (
        <button
          className={styles.primaryBtn}
          onClick={s.gameOverData.newGame}
          disabled={s.isLoading}
        >
          {s.isLoading ? "..." : "NEW GAME"}
        </button>
      );
    return null;
  })();

  // ── Lobby: simplified layout ──
  if (s.isInLobby) {
    return (
      <div className={styles.panel}>
        <div className={styles.simpleState}>
          <span className={styles.simpleLabel}>LOBBY</span>
          {primaryButton}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLabel}>INTEL</span>

          <AnimatePresence mode="wait">
            <motion.span
              key={intel.teamName}
              className={styles.teamSymbol}
              style={{ color }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: TEAM_SWITCH_DURATION, ease: EASING }}
            >
              <span style={symbolStyle}>{symbol}</span>
            </motion.span>
          </AnimatePresence>

          {s.isRoundComplete && s.gameOverData && (
            <div className={styles.scoreInline}>
              <span
                className={styles.scoreTeam}
                data-winner={s.gameOverData.winnerName === s.teamName}
              >
                {s.gameOverData.winnerName?.toUpperCase()} {s.gameOverData.winnerScore}
              </span>
              <span className={styles.scoreDash}>—</span>
              <span className={styles.scoreTeam}>
                {s.gameOverData.loserName?.toUpperCase()} {s.gameOverData.loserScore}
              </span>
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <button
            className={styles.navBtn}
            onClick={intel.onGoBack}
            disabled={!intel.canGoBack}
            aria-label="Previous turn"
          >◁</button>
          <button
            className={styles.navBtn}
            onClick={intel.onGoForward}
            disabled={!intel.canGoForward}
            aria-label="Next turn"
          >▷</button>
        </div>
      </div>

      {/* ── Intel box ── */}
      <div className={`${styles.intelBox} ${intel.isHistorical ? styles.historical : ""}`}>
        {!intel.hasClue ? (
          <div className={styles.awaiting}>
            {s.isCodemasterGivingClue ? "YOUR TURN TO TRANSMIT" : "AWAITING INTEL"}
          </div>
        ) : (
          <>
            <div className={styles.clueRow}>
              <span className={styles.clueWord}>"{intel.clueWord}"</span>
              <span className={styles.clueNumber}>: {intel.clueNumber}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.guessList}>
              {intel.guesses.map((guess, i) => {
                const { symbol: gs, color: gc, rotate: gr } = getOutcomeSymbol(
                  guess.outcome, intel.teamName
                );
                const gsStyle = gr
                  ? { display: "inline-block" as const, transform: "rotate(45deg)" }
                  : undefined;
                return (
                  <div key={i} className={styles.guessRow}>
                    <span className={styles.guessWord}>{guess.word}</span>
                    <span className={styles.guessDots} />
                    <span style={{ color: gc }}><span style={gsStyle}>{gs}</span></span>
                  </div>
                );
              })}
              {Array.from({ length: ghostCount }).map((_, i) => (
                <div key={`ghost-${i}`} className={`${styles.guessRow} ${styles.ghost}`}>
                  <span className={styles.guessWord}>· · · · ·</span>
                  <span className={styles.guessDots} />
                  <span>·</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── AI section (only when AI is in the game) ── */}
      {s.isAiActive && (
        <div className={styles.aiSection}>
          <div className={styles.aiSectionHeader}>
            <span className={styles.aiSectionLabel}>AI</span>
            <div
              className={`${styles.aiDot} ${isAiThinking ? styles.aiDotThinking : ""}`}
              aria-label={isAiThinking ? "AI thinking" : "AI ready"}
            />
          </div>
          <div className={styles.aiBox}>
            {isAiThinking ? (
              <span className={styles.aiThinkingText}>Thinking of a card...</span>
            ) : canTriggerAi ? (
              <button
                className={styles.triggerBtn}
                onClick={() => triggerAi.mutate()}
              >
                TRIGGER AI
              </button>
            ) : (
              <span className={styles.aiIdleText}>STANDING BY</span>
            )}
          </div>
        </div>
      )}

      {/* Spacer pushes footer to bottom */}
      <div className={styles.spacer} />

      {/* ── Footer: single full-width primary button ── */}
      {primaryButton && (
        <div className={styles.footer}>
          {primaryButton}
        </div>
      )}

    </div>
  );
};
