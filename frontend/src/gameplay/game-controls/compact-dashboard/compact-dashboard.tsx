import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { useIntelState } from "../dashboards/panels/use-intel-state";
import { useGameDataRequired } from "../../game-data/providers";
import { useAiStatus, useTriggerAiMove } from "../../../ai/api";
import { getTeamStyle, getOutcomeSymbol } from "../dashboards/panels/intel-panel";
import { StatusDot } from "../../shared/components";
import { CompactClueInput } from "./compact-clue-input";
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
export const CompactDashboard: React.FC<CompactDashboardProps> = ({ onOpenClueInput: _onOpenClueInput }) => {
  const s = useDashboardState();
  const intel = useIntelState();

  const { gameData } = useGameDataRequired();
  const { data: aiStatus } = useAiStatus(gameData.publicId);
  const triggerAi = useTriggerAiMove(gameData.publicId);

  const isAiThinking = (aiStatus?.thinking || triggerAi.isPending) ?? false;
  const canTriggerAi = (aiStatus?.available && !isAiThinking) ?? false;

  // Inline clue input state
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState(1);
  const [clueError, setClueError] = useState("");

  const handleTransmit = () => {
    const cards = gameData.currentRound?.cards ?? [];
    if (!clueWord.trim()) {
      setClueError("INTEL REQUIRED");
      return;
    }
    if (cards.some((c) => c.word.toLowerCase() === clueWord.toLowerCase())) {
      setClueError("CANNOT USE BOARD WORD");
      return;
    }
    setClueError("");
    s.giveClue(clueWord, clueCount);
    setClueWord("");
    setClueCount(1);
  };

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
          onClick={handleTransmit}
          disabled={!clueWord.trim() || isAiThinking || s.isLoading}
        >
          {s.isLoading ? "..." : "TRANSMIT"}
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

  // ── Lobby: centered buttons ──
  if (s.isInLobby) {
    return (
      <div className={styles.panel}>
        <div className={styles.content}>
          <div className={styles.contentSpacer} />
          <div className={styles.lobbyButtons}>
            {s.lobbyAction && (
              <button
                className={styles.primaryBtn}
                onClick={s.lobbyAction.handler}
                disabled={s.isLoading}
              >
                {s.lobbyAction.label}
              </button>
            )}
            {s.lobbyAction?.canRedeal && (
              <button
                className={styles.primaryBtn}
                onClick={s.lobbyAction.redealHandler}
                disabled={s.isLoading}
              >
                REDEAL
              </button>
            )}
          </div>
          <div className={styles.contentSpacer} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* ── Content: distributes space evenly ── */}
      <div className={styles.content}>
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

        {/* ── Clue input (floats centered when codemaster giving clue) ── */}
        {!intel.hasClue && s.isCodemasterGivingClue ? (
          /* ── Codemaster: label + clue input ── */
          <>
            <div className={styles.intelBox}>
              <div className={styles.clueRow}>
                <span className={styles.awaitingText}>INTEL REQUIRED</span>
              </div>
            </div>
            <div className={styles.clueInputCenter}>
              <CompactClueInput
                word={clueWord}
                count={clueCount}
                error={clueError}
                isLoading={s.isLoading}
                onWordChange={(w) => { setClueWord(w); setClueError(""); }}
                onCountChange={setClueCount}
                onSubmit={handleTransmit}
              />
            </div>
          </>
        ) : !intel.hasClue ? (
          /* ── No clue yet: show waiting state + AI trigger ── */
          <>
            <div className={styles.intelBox}>
              <div className={styles.clueRow}>
                <span className={styles.awaitingText}>
                  {s.role === "CODEBREAKER" ? "INTEL REQUIRED" : "AWAITING INTEL"}
                </span>
              </div>
            </div>
            {s.isAiActive && (
              <>
                <div className={styles.contentSpacer} />
                <div className={styles.aiSection}>
                  <div className={styles.aiBox}>
                    {isAiThinking ? (
                      <>
                        <button className={styles.triggerBtn} disabled>
                          THINKING...
                        </button>
                        <StatusDot active thinking />
                      </>
                    ) : canTriggerAi ? (
                      <>
                        <button className={styles.triggerBtn} onClick={() => triggerAi.mutate()}>
                          TRIGGER AI
                        </button>
                        <StatusDot active thinking={false} />
                      </>
                    ) : (
                      <>
                        <span className={styles.aiIdleText}>STANDING BY</span>
                        <StatusDot active={false} thinking={false} />
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.contentSpacer} />
              </>
            )}
          </>
        ) : (
          /* ── Intel box ── */
          <div className={`${styles.intelBox} ${intel.isHistorical ? styles.historical : ""}`}>
            <div className={styles.clueRow}>
              <span className={styles.clueWord}>"{intel.clueWord}"</span>
              <span className={styles.clueNumber}>: {intel.clueNumber}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.guessList}>
              {intel.guesses.map((guess, i) => {
                const { symbol: gs, color: gc, rotate: gr } = getOutcomeSymbol(guess.outcome, intel.teamName);
                const gsStyle = gr ? { display: "inline-block" as const, transform: "rotate(45deg)" } : undefined;
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
          </div>
        )}

        {/* Spacer pushes AI section down (only when clue exists) */}
        <div className={styles.contentSpacer} />

        {/* ── AI section: only shown once a clue is active ── */}
        {s.isAiActive && intel.hasClue && (
          <div className={styles.aiSection}>
            <div className={styles.aiBox}>
              {isAiThinking ? (
                <button className={styles.triggerBtn} disabled>
                  THINKING...
                </button>
              ) : canTriggerAi ? (
                <button className={styles.triggerBtn} onClick={() => triggerAi.mutate()}>
                  TRIGGER AI
                </button>
              ) : (
                <span className={styles.aiIdleText}>STANDING BY</span>
              )}
              <StatusDot active={canTriggerAi || isAiThinking} thinking={isAiThinking} />
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: pinned to bottom ── */}
      {primaryButton && (
        <div className={styles.footer}>
          {primaryButton}
        </div>
      )}
    </div>
  );
};
