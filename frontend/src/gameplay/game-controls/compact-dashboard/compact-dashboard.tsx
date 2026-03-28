import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { useIntelState } from "../dashboards/panels/use-intel-state";
import { useGameDataRequired } from "../../game-data/providers";
import { useAiStatus, useTriggerAiMove } from "../../../ai/api";
import { getTeamStyle, getOutcomeSymbol } from "../dashboards/panels/intel-panel";
import { TeamSymbolIcon } from "../../../shared/team-symbol-icon";
import { StatusDot, CircleButton } from "../../shared/components";
import { ActionButton } from "@frontend/gameplay/shared/components";
import { AwaitingLabel, carouselVariants, CAROUSEL_TRANSITION, useCarouselSwipe } from "../dashboards/shared";
import { CompactClueInput } from "./compact-clue-input";
import { useClueInput } from "./use-clue-input";
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

  const clue = useClueInput(gameData.currentRound?.cards ?? []);

  const handleTransmit = (): void => {
    if (!clue.validate()) return;
    s.giveClue(clue.word, clue.count);
    clue.reset();
  };

  const ghostCount = Math.max(0, (intel.maxSlots ?? 3) - intel.guesses.length);
  const { symbol, color, rotate } = getTeamStyle(intel.teamName);

  // Single primary action — disabled (not hidden) when AI is thinking
  const primaryButton = (() => {
    if (s.isCodemasterGivingClue)
      return (
        <ActionButton size="sm"
          text={s.isLoading ? "..." : "TRANSMIT"}
          onClick={handleTransmit}
          enabled={!!(clue.word.trim()) && !isAiThinking && !s.isLoading}
        />
      );
    if (s.isInLobby && s.lobbyAction)
      return (
        <ActionButton size="sm"
          text={s.isLoading ? "..." : s.lobbyAction.label}
          onClick={s.lobbyAction.handler}
          enabled={!s.isLoading}
        />
      );
    if (s.isCodebreakerGuessing)
      return (
        <ActionButton size="sm"
          text={s.isLoading ? "..." : "END TURN"}
          onClick={s.endTurn}
          enabled={!s.isLoading && !isAiThinking}
        />
      );
    if (s.canStartNextTurn)
      return (
        <ActionButton size="sm"
          text={s.startNextTurn.isPending ? "..." : "NEXT TURN"}
          onClick={s.startNextTurn.handler}
          enabled={!s.startNextTurn.isPending}
        />
      );
    if (s.isRoundComplete && s.gameOverData)
      return (
        <ActionButton size="sm"
          text={s.isLoading ? "..." : "NEW GAME"}
          onClick={s.gameOverData.newGame}
          enabled={!s.isLoading}
        />
      );
    return null;
  })();

  // Carousel swipe navigation — must be before any early returns
  const { swipeDirection, handleDragEnd, handleGoBack, handleGoForward } = useCarouselSwipe({
    canGoBack: intel.canGoBack,
    canGoForward: intel.canGoForward,
    onGoBack: intel.onGoBack,
    onGoForward: intel.onGoForward,
  });

  // ── Lobby: centered buttons ──
  if (s.isInLobby) {
    return (
      <div className={styles.panel}>
        <div className={styles.content}>
          <div className={styles.contentSpacer} />
          <div className={styles.lobbyButtons}>
            {s.lobbyAction && (
              <ActionButton size="sm"
                text={s.lobbyAction.label}
                onClick={s.lobbyAction.handler}
                enabled={!s.isLoading}
              />
            )}
            {s.lobbyAction?.canRedeal && (
              <ActionButton size="sm"
                text="REDEAL"
                onClick={s.lobbyAction.redealHandler}
                enabled={!s.isLoading}
              />
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
                style={{ "--symbol-color": color } as React.CSSProperties}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: TEAM_SWITCH_DURATION, ease: EASING }}
              >
                <TeamSymbolIcon symbol={symbol} rotate={rotate} />
              </motion.span>
            </AnimatePresence>

            {/* Score now shown in scoreBox below intel, not in header */}
          </div>

          <div className={styles.navGroup}>
            <CircleButton size="sm" onClick={handleGoBack} disabled={!intel.canGoBack} aria-label="Previous turn">{"<"}</CircleButton>
            <CircleButton size="sm" onClick={handleGoForward} disabled={!intel.canGoForward} aria-label="Next turn">{">"}</CircleButton>
          </div>
        </div>

        {/* ── Swipeable intel carousel ── */}
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
              key={intel.selectedIndex}
              custom={swipeDirection}
              variants={carouselVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={CAROUSEL_TRANSITION}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {!intel.hasClue && s.isCodemasterGivingClue ? (
                <div className={styles.clueInputCenter}>
                  <div className={styles.intelBox}>
                    <div className={styles.clueRow}>
                      <AwaitingLabel>INTEL REQUIRED</AwaitingLabel>
                    </div>
                  </div>
                  <div className={styles.intelBox}>
                    <CompactClueInput
                      word={clue.word}
                      count={clue.count}
                      error={clue.error}
                      isLoading={s.isLoading}
                      onWordChange={clue.setWord}
                      onCountChange={clue.setCount}
                      onSubmit={handleTransmit}
                    />
                  </div>
                </div>
              ) : !intel.hasClue ? (
                <div className={styles.clueInputCenter}>
                  <div className={styles.controlRow}>
                    <AwaitingLabel>INTEL REQUIRED</AwaitingLabel>
                  </div>
                </div>
              ) : intel.hasClue ? (
                <>
                  <div className={styles.intelBox}>
                    <div className={styles.clueRow}>
                      <span className={styles.clueWord}>"{intel.clueWord}"</span>
                      <span className={styles.clueNumber}>: {intel.clueNumber}</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.guessList}>
                      {intel.guesses.map((guess, i) => {
                        const { symbol: gs, color: gc, rotate: gr } = getOutcomeSymbol(guess.outcome, intel.teamName);
                        return (
                          <div key={i} className={styles.guessRow}>
                            <span className={styles.guessWord}>{guess.word}</span>
                            <span className={styles.guessDots} />
                            <TeamSymbolIcon symbol={gs} rotate={gr} color={gc} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {ghostCount > 0 && intel.guesses.length === 0 && (
                    <div className={styles.clueInputCenter}>
                      <div className={styles.controlRow}>
                        <AwaitingLabel>AWAITING INPUT</AwaitingLabel>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Score comparison (game-over) ── */}
        {s.isRoundComplete && s.gameOverData && (
          <div className={styles.scoreBox}>
            <div className={styles.scoreBoxTeam}>
              <div className={styles.scoreBoxName}>{s.gameOverData.winnerName?.toUpperCase()}</div>
              <div className={`${styles.scoreBoxValue} ${styles.scoreWinner}`}>
                {s.gameOverData.winnerScore}
              </div>
            </div>
            <div className={styles.scoreBoxDivider}>—</div>
            <div className={styles.scoreBoxTeam}>
              <div className={styles.scoreBoxName}>{s.gameOverData.loserName?.toUpperCase()}</div>
              <div className={styles.scoreBoxValue}>{s.gameOverData.loserScore}</div>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer: pinned to bottom ── */}
      <div className={styles.footer}>
        {primaryButton ? (
          primaryButton
        ) : s.isAiActive ? (
          <div className={styles.controlRow}>
            {isAiThinking ? (
              <>
                <button className={styles.triggerBtn} disabled>
                  THINKING...
                </button>
                <span className={styles.controlRowDot}><StatusDot active thinking /></span>
              </>
            ) : canTriggerAi ? (
              <>
                <button className={styles.triggerBtn} onClick={() => triggerAi.mutate()}>
                  TRIGGER AI
                </button>
                <span className={styles.controlRowDot}><StatusDot active thinking={false} /></span>
              </>
            ) : (
              <>
                <span className={styles.aiIdleText}>STANDING BY</span>
                <span className={styles.controlRowDot}><StatusDot active={false} thinking={false} /></span>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
