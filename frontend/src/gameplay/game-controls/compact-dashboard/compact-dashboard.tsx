import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { useIntelState } from "../dashboards/panels/use-intel-state";
import { useViewMode } from "../../game-board/view-mode/view-mode-context";
import { getTeamStyle, getOutcomeSymbol } from "../dashboards/panels/intel-panel";
import styles from "./compact-dashboard.module.css";

// Animation constants matching landscape intel panel
const TEAM_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

interface CompactDashboardProps {
  /** Opens the codemaster clue input overlay */
  onOpenClueInput: () => void;
}

/**
 * Compact vertical dashboard for constrained viewports.
 * Three sections: intel header | intel display | footer (AR + action)
 * Shows a simplified status panel for non-gameplay states (lobby, game over).
 * Used by DesktopScene (portrait) and MobileScene (landscape).
 */
export const CompactDashboard: React.FC<CompactDashboardProps> = ({ onOpenClueInput }) => {
  const s = useDashboardState();
  const intel = useIntelState();
  const { viewMode, toggleSpymasterViewMode } = useViewMode();
  const isARMode = viewMode === "spymaster";

  // Non-gameplay states — simple centred layout, no intel needed
  const showSimple = s.isInLobby;

  // Ghost rows to pad guess list up to maxSlots
  const ghostCount = Math.max(0, intel.maxSlots - intel.guesses.length);

  // Exactly one action button at a time
  const actionButton = (() => {
    if (s.isCodemasterGivingClue)
      return (
        <button className={styles.actionBtn} onClick={onOpenClueInput}>
          TRANSMIT
        </button>
      );
    if (s.isInLobby && s.lobbyAction)
      return (
        <button
          className={styles.actionBtn}
          onClick={s.lobbyAction.handler}
          disabled={s.isLoading}
        >
          {s.isLoading ? "..." : s.lobbyAction.label}
        </button>
      );
    if (s.isCodebreakerGuessing)
      return (
        <button className={styles.actionBtn} onClick={s.endTurn} disabled={s.isLoading}>
          {s.isLoading ? "..." : "END TURN"}
        </button>
      );
    if (s.canStartNextTurn)
      return (
        <button
          className={styles.actionBtn}
          onClick={s.startNextTurn.handler}
          disabled={s.startNextTurn.isPending}
        >
          {s.startNextTurn.isPending ? "..." : "NEXT TURN"}
        </button>
      );
    if (s.isRoundComplete && s.gameOverData)
      return (
        <button
          className={styles.actionBtn}
          onClick={s.gameOverData.newGame}
          disabled={s.isLoading}
        >
          {s.isLoading ? "..." : "NEW GAME"}
        </button>
      );
    return null;
  })();

  // ── Simple layout (lobby / game over) ──
  if (showSimple) {
    return (
      <div className={styles.panel}>
        <div className={styles.simpleState}>
          <span className={styles.simpleLabel}>
            {s.isRoundComplete ? "ROUND OVER" : "LOBBY"}
          </span>
          {actionButton}
        </div>
      </div>
    );
  }

  // Team symbol for intel header
  const { symbol, color, rotate } = getTeamStyle(intel.teamName);
  const symbolStyle = rotate
    ? { display: "inline-block" as const, transform: "rotate(45deg)" }
    : undefined;

  return (
    <div className={styles.panel}>

      {/* ── Header: label + team symbol ── */}
      <div className={styles.intelHeader}>
        <span className={styles.intelTitle}>INTEL</span>
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
      </div>

      {/* ── Intel display box ── */}
      <div className={`${styles.intelDisplay} ${intel.isHistorical ? styles.historical : ""}`}>
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
              {/* Real guesses */}
              {intel.guesses.map((guess, i) => {
                const { symbol: gs, color: gc, rotate: gr } = getOutcomeSymbol(
                  guess.outcome,
                  intel.teamName
                );
                const gsStyle = gr
                  ? { display: "inline-block" as const, transform: "rotate(45deg)" }
                  : undefined;
                return (
                  <div key={i} className={styles.guessRow}>
                    <span className={styles.guessWord}>{guess.word}</span>
                    <span className={styles.guessDots} />
                    <span style={{ color: gc }}>
                      <span style={gsStyle}>{gs}</span>
                    </span>
                  </div>
                );
              })}

              {/* Ghost rows — pad to maxSlots */}
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

      {/* ── Footer: inline AR toggle (codemaster only) + action button ── */}
      <div className={styles.footer}>
        {s.isRoundComplete && s.gameOverData ? (
          // Round over footer: score (left) + new game (center) + nav arrows (right)
          <>
            <div className={styles.footerLeft}>
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
            </div>
            <div className={styles.footerAction}>
              <button
                className={styles.actionBtn}
                onClick={s.gameOverData.newGame}
                disabled={s.isLoading}
              >
                {s.isLoading ? "..." : "NEW GAME"}
              </button>
            </div>
            <div className={styles.footerRight}>
              <div className={styles.navGroup}>
                <button
                  className={styles.navBtn}
                  onClick={intel.onGoBack}
                  disabled={!intel.canGoBack}
                  aria-label="Previous turn"
                >
                  ◁
                </button>
                <button
                  className={styles.navBtn}
                  onClick={intel.onGoForward}
                  disabled={!intel.canGoForward}
                  aria-label="Next turn"
                >
                  ▷
                </button>
              </div>
            </div>
          </>
        ) : (
          // Normal footer: left (AR toggle) + center (action) + right (nav arrows)
          <>
            <div className={styles.footerLeft}>
              {s.isCodemaster && (
                <div className={styles.arInline}>
                  <span className={styles.arDot} data-active={isARMode} />
                  <span className={styles.arLabel}>AR</span>
                  <label className={styles.arSwitch}>
                    <input
                      type="checkbox"
                      checked={isARMode}
                      onChange={toggleSpymasterViewMode}
                    />
                    <span className={styles.arSlider} />
                  </label>
                  <span className={styles.arStatus} data-active={isARMode}>
                    {isARMode ? "ON" : "OFF"}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.footerAction}>
              {actionButton}
            </div>
            <div className={styles.footerRight}>
              <div className={styles.navGroup}>
                <button
                  className={styles.navBtn}
                  onClick={intel.onGoBack}
                  disabled={!intel.canGoBack}
                  aria-label="Previous turn"
                >
                  ◁
                </button>
                <button
                  className={styles.navBtn}
                  onClick={intel.onGoForward}
                  disabled={!intel.canGoForward}
                  aria-label="Next turn"
                >
                  ▷
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
