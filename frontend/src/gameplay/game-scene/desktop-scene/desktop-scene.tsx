import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVisibilityContext } from "../../game-controls/dashboards/config/context";
import { isCodebreakerGuessing, isRoundComplete } from "../../game-controls/dashboards/config/rules";
import { useGameActions } from "../../game-actions";
import type { Card } from "../../../shared-types";
import { GameBoard } from "../../game-board/boards/game-board";
import { ArFab } from "../../game-board/boards/ar-fab";
import { StackedDashboard } from "../../game-controls/stacked-dashboard";
import { CompactDashboard } from "../../game-controls/compact-dashboard";
import { TeamHeaderPanel } from "../../game-controls/dashboards/panels";
import { GameOverOverlay } from "../../game-over";
import { CodeWordInput } from "../../game-controls/dashboards";
import styles from "./desktop-scene.module.css";

const dashboardExpandVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    borderRadius: "50%",
  },
  visible: {
    scale: 1,
    opacity: 1,
    borderRadius: "var(--radius-md)",
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

interface DesktopSceneProps {
  isFetching: boolean;
  showDashboard?: boolean;
}

/**
 * Desktop scene — handles portrait and landscape layouts via CSS.
 *
 * Portrait:  [banner][board][CompactDashboard]
 * Landscape: [StackedDashboard sidebar][board]
 *
 * Pure CSS orientation queries within this scene — no JS orientation detection.
 * Only ever mounted when DisplayType === "desktop".
 */
export const DesktopScene: React.FC<DesktopSceneProps> = ({ isFetching, showDashboard = true }) => {
  const ctx = useVisibilityContext();
  const { makeGuess, giveClue, actionState } = useGameActions();
  const [showCluePanel, setShowCluePanel] = useState(false);

  const isGuessing = isCodebreakerGuessing(ctx);
  const isLoading = ctx.isActionLoading;
  const roundComplete = isRoundComplete(ctx);

  const handleCardClick = useCallback(
    (word: string) => { if (!isLoading && isGuessing) makeGuess(word); },
    [makeGuess, isLoading, isGuessing],
  );

  const canInteract = useCallback(
    (card: Card) => isGuessing && !isLoading && !card.selected,
    [isGuessing, isLoading],
  );

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowCluePanel(false);
  };

  return (
    <>
      {roundComplete && <GameOverOverlay />}

      <div className={styles.scene}>

        {/* Portrait only — hidden in landscape via CSS */}
        <motion.div
          className={styles.banner}
          variants={dashboardExpandVariants}
          initial={showDashboard ? "visible" : "hidden"}
          animate="visible"
        >
          <TeamHeaderPanel />
        </motion.div>

        <div className={styles.board}>
          <GameBoard onCardClick={handleCardClick} canInteract={canInteract} />
          <div className={styles.arFabSlot}>
            <ArFab />
          </div>
        </div>

        {/* Portrait only — CompactDashboard bottom strip */}
        <motion.div
          className={styles.compactArea}
          variants={dashboardExpandVariants}
          initial={showDashboard ? "visible" : "hidden"}
          animate="visible"
        >
          <CompactDashboard onOpenClueInput={() => setShowCluePanel(true)} />
        </motion.div>

        {/* Landscape only — StackedDashboard sidebar */}
        <motion.div
          className={styles.stackedArea}
          variants={dashboardExpandVariants}
          initial={showDashboard ? "visible" : "hidden"}
          animate="visible"
          style={{ overflow: "hidden" }}
        >
          <StackedDashboard isFetching={isFetching} instanceId="desktop" />
        </motion.div>

        {/* Clue input overlay */}
        <div className={styles.clueOverlay} data-visible={showCluePanel}>
          <div className={styles.panelHeader}>
            <button className={styles.closeButton} onClick={() => setShowCluePanel(false)}>
              ×
            </button>
            <h1 className={styles.hackerTitle}>TRANSMIT CLUE</h1>
          </div>
          <div className={styles.clueContent}>
            <CodeWordInput
              codeWord=""
              numberOfCards={null}
              isEditable={true}
              isLoading={actionState.status === "loading"}
              onSubmit={handleSubmitClue}
            />
          </div>
        </div>

      </div>
    </>
  );
};
