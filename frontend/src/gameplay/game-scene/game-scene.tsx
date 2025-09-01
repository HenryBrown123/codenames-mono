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
import { CardVisibilityManager } from "../game-board/cards/card-visibility-manager";
import { UISettingsDashboard } from "../game-controls/settings/ui-settings-dashboard";

/**
 * Game Scene Component with unified mobile-first layout
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene } = usePlayerScene();
  const [showCluePanel, setShowCluePanel] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [boardTilt, setBoardTilt] = useState(0);
  const [fontNormalSize, setFontNormalSize] = useState(14);
  const [fontLongSize, setFontLongSize] = useState(14);
  const [fontThreshold, setFontThreshold] = useState(9);
  const { giveClue, actionState } = useGameActions();

  // Get current message
  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);

  // CSS custom properties for dynamic font sizing
  const fontVariables = {
    "--font-normal-size": `${fontNormalSize}px`,
    "--font-long-size": `${fontLongSize}px`,
    "--font-threshold": fontThreshold,
  } as React.CSSProperties;

  // Show skeleton during initial load
  if (isPending && !gameData) {
    return (
      <div className={styles.gameSceneContainer}>
        <div className={styles.boardArea}>
          <SpectatorBoard tilt={boardTilt} />
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

  // Handle game over state
  if (gameData?.currentRound?.status === "COMPLETED") {
    return (
      <div className={styles.gameSceneContainer}>
        <div className={styles.boardArea}>
          <SpectatorBoard tilt={boardTilt} />
        </div>
        <div className={styles.controlArea}>
          <div>Game Completed!</div>
        </div>
      </div>
    );
  }

  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = React.useMemo(() => {
    const Component = getBoardComponent(currentRole, currentScene);
    return (props: { tilt?: number }) => (
      <Component {...props} key={`${currentRole}-${currentScene}`} />
    );
  }, [currentRole, currentScene]);

  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowCluePanel(false);
  };

  return (
    <>
      <CardVisibilityManager cards={cards} initialState={isRoundSetup ? "hidden" : "visible"} />
      
      {/* UI Settings Dashboard */}
      <UISettingsDashboard
        fontNormalSize={fontNormalSize}
        fontLongSize={fontLongSize}
        fontThreshold={fontThreshold}
        onFontNormalSizeChange={setFontNormalSize}
        onFontLongSizeChange={setFontLongSize}
        onFontThresholdChange={setFontThreshold}
        tiltValue={boardTilt}
        onTiltChange={setBoardTilt}
      />

      <div className={styles.gameSceneContainer} style={fontVariables}>
        {/* Main game board */}
        <div className={styles.boardArea}>
          <BoardComponent tilt={boardTilt} />
        </div>

        {/* Control area - SINGLE dashboard, CSS handles layout */}
        <div className={styles.controlArea}>
          {isFetching && <div className={styles.refetchIndicator} />}

          <DashboardComponent
            messageText={messageText}
            onOpenCluePanel={() => setShowCluePanel(true)}
          />
        </div>

        {/* Mobile-only overlays */}
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
