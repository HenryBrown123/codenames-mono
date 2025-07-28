import React, { useState } from "react";
import { useGameDataRequired, useTurn } from "../shared/providers";
import styles from "./game-scene.module.css";
import { usePlayerScene } from "./";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { SpectatorBoard } from "../ui-components/boards/spectator-board";
import { DesktopSidebar } from "../ui-components/desktop-sidebar";
import { GameInstructions } from "../ui-components/game-instructions";
import { ActionButton } from "../shared/components";
import { CodeWordInput } from "../ui-components/dashboards/codemaster-input";
import { useGameActions } from "../player-actions";
import { CardVisibilityProvider } from "../ui-components/cards/card-visibility-provider";
import { TiltControl } from "../ui-components/board-controls/tilt-control";









/**
 * Game Scene Component with mobile-first collapsible instructions
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene } = usePlayerScene();
  const [showCluePanel, setShowCluePanel] = useState(false);
  const [boardTilt, setBoardTilt] = useState(0);
  const { giveClue, actionState } = useGameActions();
  // Get current message
  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);
  const [toggleMessage, setToggleMessage] = useState(false);

  // Show skeleton during initial load
  if (isPending && !gameData) {
    return (
      <div className={styles.gameSceneContainer}>
        <div className={styles.gameBoardContainer}>
          <SpectatorBoard tilt={boardTilt} />
        </div>
        <div className={styles.dashboardContainer} />
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
        <div className={styles.gameBoardContainer}>
          <SpectatorBoard tilt={boardTilt} />
        </div>
        <div className={styles.dashboardContainer}>
          <div>Game Completed!</div>
        </div>
      </div>
    );
  }

  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  
  // Update getBoardComponent to pass tilt
  const BoardComponent = React.useMemo(() => {
    const Component = getBoardComponent(currentRole, currentScene);
    return () => <Component tilt={boardTilt} />;
  }, [currentRole, currentScene, boardTilt]);

  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowCluePanel(false);
  };

  // Check if we should use sidebar layout
  const [isLandscapeTablet, setIsLandscapeTablet] = React.useState(
    window.matchMedia("(min-width: 769px) and (orientation: landscape)").matches,
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 769px) and (orientation: landscape)");
    const handleChange = (e: MediaQueryListEvent) => setIsLandscapeTablet(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isLandscapeTablet) {
    // Sidebar layout for tablet landscape and desktop
    return (
      <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
        {/* Desktop only tilt control */}
        <TiltControl value={boardTilt} onChange={setBoardTilt} />
        
        <div className={styles.gameSceneContainer}>
          <DesktopSidebar isFetching={isFetching}>
            <DashboardComponent
              messageText={messageText}
              onOpenCluePanel={() => setShowCluePanel(true)}
            />
          </DesktopSidebar>

          <div className={styles.gameBoardContainer}>
            <BoardComponent />
          </div>
        </div>
      </CardVisibilityProvider>
    );
  }

  // Mobile layout - board + dashboard with pure CSS animated instructions
  return (
    <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
      <div className={styles.gameSceneContainer}>
        {/* Instructions panel with pure CSS animation */}
        <div className={styles.instructionsPanel} key={`instruction-${messageText}-${toggleMessage}`}>
          <div className={styles.panelContent}>
            <GameInstructions messageText={messageText} />
          </div>
          <div className={styles.progressBar} key={messageText} />
        </div>

        {/* MOBILE CLUE PANEL - FULL SCREEN TAKEOVER */}
        <div className={`${styles.cluePanelBackdrop} ${showCluePanel ? styles.visible : styles.hidden}`} onClick={() => setShowCluePanel(false)} />

        <div className={`${styles.cluePanel} ${showCluePanel ? styles.visible : styles.hidden}`}>
          <div className={styles.hackerDecoration} />

          <div className={styles.cluePanelHeader}>
            <button className={styles.clueCloseButton} onClick={() => setShowCluePanel(false)}>×</button>
            <h1 className={styles.hackerTitle}>TRANSMIT CLUE</h1>
          </div>

          <div className={styles.cluePanelContent}>
            <CodeWordInput
              codeWord=""
              numberOfCards={null}
              isEditable={true}
              isLoading={actionState.status === "loading"}
              onSubmit={handleSubmitClue}
            />
          </div>
        </div>

        {/* Help button to manually show instructions */}
        <button className={`${styles.helpButton} ${styles.inactive}`} onClick={() => setToggleMessage(!toggleMessage)}>
          ?
        </button>

        <div className={styles.gameBoardContainer}>
          <BoardComponent />
        </div>

        <div className={styles.dashboardContainer}>
          <DashboardComponent onOpenCluePanel={() => setShowCluePanel(true)} />
        </div>
      </div>
    </CardVisibilityProvider>
  );
};

GameScene.displayName = "GameScene";
