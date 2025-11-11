import React, { useState } from "react";
import { useGameDataRequired, useTurn } from "../game-data/providers";
import styles from "./game-scene.module.css";
import { usePlayerScene } from "./";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { SpectatorBoard } from "../game-board/boards/spectator-board";
import { GameInstructions } from "../shared/game-instructions";
import { ActionButton } from "../shared/components";
import { CodeWordInput } from "../game-controls/dashboards/codemaster-input";
import { useGameActions } from "../game-actions";
import { GameOverOverlay } from "../game-over";

export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const { activeTurn } = useTurn();

  const { currentRole, currentScene } = usePlayerScene();
  const [showCluePanel, setShowCluePanel] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { giveClue, actionState } = useGameActions();

  const DashboardComponent = getDashboardComponent(currentRole, currentScene, gameData);

  const BoardComponent = React.useMemo(() => {
    return getBoardComponent(currentRole);
  }, [currentRole]);

  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);

  if (isPending && !gameData) {
    return (
      <div className={styles.gameSceneContainer}>
        <div className={styles.boardArea}>
          <SpectatorBoard scene={currentScene} />
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

  const isRoundComplete = gameData.currentRound?.status === "COMPLETED";

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowCluePanel(false);
  };

  return (
    <>
      {isRoundComplete && <GameOverOverlay />}

      <div className={styles.gameSceneContainer}>
        <div className={styles.boardArea}>
          <BoardComponent scene={currentScene} />
        </div>

        <div className={styles.controlArea}>
          {isFetching && <div className={styles.refetchIndicator} />}

          <DashboardComponent
            messageText={messageText}
            onOpenCluePanel={() => setShowCluePanel(true)}
          />
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
