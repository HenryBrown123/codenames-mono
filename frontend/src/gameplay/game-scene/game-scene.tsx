import React, { useState, useCallback } from "react";
import { useGameDataRequired, useTurn } from "../game-data/providers";
import { useVisibilityContext } from "../game-controls/dashboards/config/context";
import { isCodebreakerGuessing, isRoundComplete } from "../game-controls/dashboards/config/rules";
import { useGameActions } from "../game-actions";
import { deriveMessage } from "./derive-message";
import { GameBoard } from "../game-board/boards/game-board";
import { GameDashboard } from "../game-controls/dashboards";
import { GameInstructions } from "../shared/game-instructions";
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
  const { activeTurn } = useTurn();
  const ctx = useVisibilityContext();
  const { makeGuess, giveClue, actionState } = useGameActions();

  const [showCluePanel, setShowCluePanel] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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

  // --- Derive message ---
  const messageText = deriveMessage(ctx, ctx.lastCompletedTurn, activeTurn ?? null);

  // --- Loading / error states ---
  if (isPending && !gameData) {
    return (
      <div className={styles.gameSceneContainer}>
        <div className={styles.boardArea}>
          <GameBoard />
        </div>
        <div className={styles.controlArea} />
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
        <div className={styles.boardArea}>
          <GameBoard onCardClick={handleCardClick} canInteract={canInteract} />
        </div>

        <div className={styles.controlArea}>
          {isFetching && <div className={styles.refetchIndicator} />}

          <GameDashboard key={roundComplete ? "game-over" : `${ctx.role}-dashboard`} />
        </div>

        <div className={styles.instructionsOverlay} data-visible={showInstructions}>
          <GameInstructions messageText={messageText} />
          <button className={styles.closeButton} onClick={() => setShowInstructions(false)}>
            ×
          </button>
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

        <button className={styles.helpButton} onClick={() => setShowInstructions(true)}>
          ?
        </button>
      </div>
    </>
  );
};

GameScene.displayName = "GameScene";
