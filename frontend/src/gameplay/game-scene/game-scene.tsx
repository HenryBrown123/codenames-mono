import React, { useState, useCallback } from "react";
import { useGameDataRequired } from "../game-data/providers";
import { useVisibilityContext } from "../game-controls/dashboards/config/context";
import { isCodebreakerGuessing, isRoundComplete } from "../game-controls/dashboards/config/rules";
import { useGameActions } from "../game-actions";
import { GameBoard } from "../game-board/boards/game-board";
import { LandscapeDashboard } from "../game-controls/landscape-dashboard";
import { PortraitDashboard } from "../game-controls/portrait-dashboard";
import { TeamHeaderPanel } from "../game-controls/dashboards/panels";
import { ActionButton } from "../shared/components";
import { CodeWordInput } from "../game-controls/dashboards";
import { GameOverOverlay } from "../game-over";
import styles from "./game-scene.module.css";

/**
 * Main game scene — derives everything from server data via VisibilityContext.
 * No scene state machine. Board behaviour injected via props.
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const ctx = useVisibilityContext();
  const { makeGuess, giveClue, actionState } = useGameActions();

  const [showCluePanel, setShowCluePanel] = useState(false);

  // --- Derive board handlers from visibility context ---
  const isGuessing = isCodebreakerGuessing(ctx);
  const isLoading = ctx.isActionLoading;

  const handleCardClick = useCallback(
    (word: string) => {
      if (!isLoading && isGuessing) {
        makeGuess(word);
      }
    },
    [makeGuess, isLoading, isGuessing],
  );

  const canInteract = useCallback(
    (card: any) => isGuessing && !isLoading && !card.selected,
    [isGuessing, isLoading],
  );

  // --- Loading / error states ---
  if (isPending && !gameData) {
    return (
      <div className={styles.gameSceneContainer}>
        <div className={styles.boardArea}>
          <GameBoard />
        </div>
        <div className={styles.portraitControlArea} />
        <div className={styles.landscapeControlArea} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.gameSceneContainer}>
        <div className={styles.errorContainer}>
          <h2>Failed to load game</h2>
          <p>{error?.message || "Unknown error"}</p>
          <ActionButton onClick={refetch} text="Retry" enabled={true} />
        </div>
      </div>
    );
  }

  const roundComplete = isRoundComplete(ctx);

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowCluePanel(false);
  };

  return (
    <>
      {roundComplete && <GameOverOverlay />}

      <div className={styles.gameSceneContainer}>
        {/* Portrait banner — CSS hides this in landscape */}
        <div className={styles.portraitBanner}>
          <TeamHeaderPanel hideDivider />
        </div>

        <div className={styles.boardArea}>
          <GameBoard onCardClick={handleCardClick} canInteract={canInteract} />
        </div>

        {/* Portrait strip — CSS hides this in landscape */}
        <div className={styles.portraitControlArea}>
          <PortraitDashboard onOpenClueInput={() => setShowCluePanel(true)} />
        </div>

        {/* Landscape sidebar — CSS hides this in portrait */}
        <div className={styles.landscapeControlArea}>
          <LandscapeDashboard isFetching={isFetching} />
        </div>

        <div className={styles.clueOverlay} data-visible={showCluePanel}>
          <div className={styles.hackerDecoration} />

          <div className={styles.panelHeader}>
            <button className={styles.closeButton} onClick={() => setShowCluePanel(false)}>
              ×
            </button>
            <h1 className={styles.hackerTitle}>TRANSMIT CLUE</h1>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1.5rem",
            }}
          >
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

GameScene.displayName = "GameScene";
