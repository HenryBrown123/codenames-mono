import React, { useState, useCallback } from "react";
import { useVisibilityContext } from "../../game-controls/dashboards/config/context";
import { isCodebreakerGuessing, isRoundComplete } from "../../game-controls/dashboards/config/rules";
import { useGameActions } from "../../game-actions";
import { useGameDataRequired } from "../../game-data";
import { GameBoard } from "../../game-board/boards/game-board";
import { ArFab } from "../../game-board/boards/ar-fab";
import { CompactDashboard } from "../../game-controls/compact-dashboard";
import { TeamHeaderPanel } from "../../game-controls/dashboards/panels";
import { GameOverOverlay } from "../../game-over";
import { CodeWordInput } from "../../game-controls/dashboards";
import { useGameEventCallback } from "../../../websocket/use-game-event-callback";
import styles from "./mobile-scene.module.css";

interface MobileSceneProps {
  isFetching: boolean;
}

/**
 * Mobile scene — board is always fullscreen.
 * Dashboards are overlays; they never push or shrink the board.
 *
 * Portrait:  swipe-up handle at bottom → CompactDashboard slides up
 * Landscape: tab on left edge          → CompactDashboard slides in from left
 *
 * CSS controls which trigger/overlay is visible per orientation.
 * Only ever mounted when DisplayType === "mobile".
 */
export const MobileScene: React.FC<MobileSceneProps> = () => {
  const ctx = useVisibilityContext();
  const { makeGuess, giveClue, actionState } = useGameActions();
  const { gameData } = useGameDataRequired();

  const [portraitOpen, setPortraitOpen] = useState(false);
  const [landscapeOpen, setLandscapeOpen] = useState(false);
  const [showCluePanel, setShowCluePanel] = useState(false);

  const isGuessing = isCodebreakerGuessing(ctx);
  const isLoading = ctx.isActionLoading;
  const roundComplete = isRoundComplete(ctx);

  // Auto-open drawers when game events occur
  const openDrawers = useCallback(() => {
    setPortraitOpen(true);
    setLandscapeOpen(true);
  }, []);

  useGameEventCallback(gameData.publicId, openDrawers);

  const handleCardClick = useCallback(
    (word: string) => { if (!isLoading && isGuessing) makeGuess(word); },
    [makeGuess, isLoading, isGuessing],
  );

  const canInteract = useCallback(
    (card: any) => isGuessing && !isLoading && !card.selected,
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

        {/* Board always fills the scene */}
        <div className={styles.board}>
          <GameBoard onCardClick={handleCardClick} canInteract={canInteract} />
          <div className={styles.arFabSlot}>
            <ArFab />
          </div>
        </div>

        {/* ── PORTRAIT ── */}

        <button
          className={styles.portraitHandle}
          onClick={() => setPortraitOpen(true)}
          aria-label="Open dashboard"
        >
          <span className={styles.handlePip} />
        </button>

        <div className={styles.portraitDrawer} data-open={portraitOpen}>
          <div className={styles.drawerHeader}>
            <TeamHeaderPanel />
            <button className={styles.drawerClose} onClick={() => setPortraitOpen(false)}>
              ×
            </button>
          </div>
          <div className={styles.drawerContent}>
            <CompactDashboard onOpenClueInput={() => setShowCluePanel(true)} />
          </div>
        </div>

        {/* ── LANDSCAPE ── */}

        <button
          className={styles.landscapeTab}
          onClick={() => setLandscapeOpen(v => !v)}
          data-open={landscapeOpen}
          aria-label="Toggle dashboard"
        >
          {landscapeOpen ? "◀" : "▶"}
        </button>

        <div className={styles.landscapeOverlay} data-open={landscapeOpen}>
          <div className={styles.landscapeHeader}>
            <TeamHeaderPanel />
          </div>
          <div className={styles.landscapeContent}>
            <CompactDashboard onOpenClueInput={() => setShowCluePanel(true)} />
          </div>
        </div>

        {/* Clue input overlay — portrait only */}
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
