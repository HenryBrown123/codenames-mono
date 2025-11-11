import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
import { VictoryFlash } from "../game-over/victory-flash";
import { GAME_OVER_TIMING } from "../game-over/game-over-timing";

/**
 * Game Scene Component with unified mobile-first layout
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const { activeTurn } = useTurn();

  const { currentRole, currentScene } = usePlayerScene();
  const [showCluePanel, setShowCluePanel] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showVictoryFlash, setShowVictoryFlash] = useState(false);
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

  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";
  const isRoundComplete = gameData.currentRound?.status === "COMPLETED";

  useEffect(() => {
    if (isRoundComplete && !showVictoryFlash) {
      setShowVictoryFlash(true);
      const timer = setTimeout(() => {
        setShowVictoryFlash(false);
      }, GAME_OVER_TIMING.FLASH_HOLD_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isRoundComplete, showVictoryFlash]);

  const winningTeam = gameData.teams?.find((team) => team.score >= 9);
  const teamColor = winningTeam?.name.includes('Red') 
    ? 'var(--color-team-red)' 
    : 'var(--color-team-blue)';

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowCluePanel(false);
  };

  return (
    <>
      {/* Victory Flash Only */}
      <AnimatePresence>
        {showVictoryFlash && (
          <VictoryFlash 
            winnerName={winningTeam?.name || 'TEAM'}
            teamColor={teamColor}
          />
        )}
      </AnimatePresence>

      <div className={styles.gameSceneContainer}>
        {/* Main game board */}
        <div className={styles.boardArea}>
          <BoardComponent scene={currentScene} />
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
