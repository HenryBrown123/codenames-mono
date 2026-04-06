import React, { useState, useCallback } from "react";
import { useVisibilityContext } from "../../dashboard/config/context";
import { isCodebreakerGuessing, isRoundComplete } from "../../dashboard/config/rules";
import { useGameActions } from "../../dashboard";
import type { Card } from "@frontend/shared/types";
import { GameBoard, ArFab } from "../../board/boards";
import { CompactDashboard } from "../../dashboard/compact-dashboard";
import { TeamHeaderPanel } from "../../dashboard/panels";
import { GameOverOverlay } from "../../game-over";
import { CodeWordInput } from "../../dashboard";
import styles from "./windowed-scene.module.css";

interface WindowedSceneProps {
  isFetching: boolean;
}

/**
 * Windowed scene — medium viewports between mobile and true desktop.
 *
 * Always: [banner][board][CompactDashboard strip]
 * No orientation switching — this layout works in any orientation.
 * No sidebar — not enough room without risking card text wrapping or
 * dashboard scrolling.
 *
 * Mounted when: width < 1000 OR height < 800, but short edge >= 500.
 */
export const WindowedScene: React.FC<WindowedSceneProps> = ({ isFetching }) => {
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

        <div className={styles.banner}>
          <TeamHeaderPanel />
        </div>

        <div className={styles.board}>
          <GameBoard onCardClick={handleCardClick} canInteract={canInteract} />
          <div className={styles.arFabSlot}>
            <ArFab />
          </div>
        </div>

        <div className={styles.compactArea}>
          <CompactDashboard onOpenClueInput={() => setShowCluePanel(true)} />
        </div>

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
