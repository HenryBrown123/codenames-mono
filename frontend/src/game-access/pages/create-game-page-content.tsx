import React, { useState } from "react";
import { useCreateNewGame } from "@frontend/game-access/api/query-hooks/use-create-new-game";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "@frontend/gameplay/shared/components";
import { GAME_TYPE, GAME_FORMAT, GameType, GameFormat } from "@codenames/shared/types";
import styles from "./create-game-page-content.module.css";

/**
 * Game creation form with mode selection and AI options
 */

export interface CreateGamePageViewProps {
  isExiting: boolean;
  gameType: GameType;
  gameFormat: GameFormat;
  aiMode: boolean;
  error: string | null;
  onGameTypeChange: (type: GameType) => void;
  onGameFormatChange: (format: GameFormat) => void;
  onAiModeChange: (enabled: boolean) => void;
  onCreateGame: () => void;
}

export const CreateGamePageView: React.FC<CreateGamePageViewProps> = ({
  isExiting,
  gameType,
  gameFormat,
  aiMode,
  error,
  onGameTypeChange,
  onGameFormatChange,
  onAiModeChange,
  onCreateGame,
}) => (
  <div className={styles.container}>
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div key="page-content" exit={{ opacity: 1 }}>
          <AnimatePresence propagate>
            <motion.div
              className={styles.mainContent}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1] as const,
                },
              }}
              exit={{
                opacity: 0,
                scale: [1, 0, 0] as const,
                y: 0,
                transition: {
                  duration: 1,
                  times: [0, 0.6, 1] as const,
                  ease: [0.4, 0, 0.2, 1] as const,
                },
              }}
            >
              <div className={styles.header}>
                <h1 className={styles.title}>NEW GAME</h1>
                <div className={styles.subtitle}>Configure game parameters</div>
              </div>

              <div className={styles.terminalBox}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.prompt}>{">"}</span>
                    <span className={styles.sectionTitle}>GAME TYPE</span>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.optionButton} ${
                        gameType === GAME_TYPE.SINGLE_DEVICE ? styles.selected : ""
                      }`}
                      onClick={() => onGameTypeChange(GAME_TYPE.SINGLE_DEVICE)}
                    >
                      <span className={styles.buttonLabel}>SINGLE DEVICE</span>
                      <span className={styles.buttonDesc}>Pass & play on one device</span>
                    </button>
                    <button
                      className={`${styles.optionButton} ${
                        gameType === GAME_TYPE.MULTI_DEVICE ? styles.selected : ""
                      }`}
                      onClick={() => onGameTypeChange(GAME_TYPE.MULTI_DEVICE)}
                    >
                      <span className={styles.buttonLabel}>MULTI DEVICE</span>
                      <span className={styles.buttonDesc}>Each player on their device</span>
                    </button>
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.prompt}>{">"}</span>
                    <span className={styles.sectionTitle}>GAME FORMAT</span>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.optionButton} ${
                        gameFormat === GAME_FORMAT.QUICK ? styles.selected : ""
                      }`}
                      onClick={() => onGameFormatChange(GAME_FORMAT.QUICK)}
                    >
                      <span className={styles.buttonLabel}>QUICK</span>
                      <span className={styles.buttonDesc}>Single round</span>
                    </button>
                    <button
                      className={`${styles.optionButton} ${
                        gameFormat === GAME_FORMAT.BEST_OF_THREE ? styles.selected : ""
                      }`}
                      onClick={() => onGameFormatChange(GAME_FORMAT.BEST_OF_THREE)}
                    >
                      <span className={styles.buttonLabel}>BEST OF 3</span>
                      <span className={styles.buttonDesc}>First to 2 wins</span>
                    </button>
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.prompt}>{">"}</span>
                    <span className={styles.sectionTitle}>AI MODE</span>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.optionButton} ${!aiMode ? styles.selected : ""}`}
                      onClick={() => onAiModeChange(false)}
                    >
                      <span className={styles.buttonLabel}>OFF</span>
                      <span className={styles.buttonDesc}>Players only</span>
                    </button>
                    <button
                      className={`${styles.optionButton} ${aiMode ? styles.selected : ""}`}
                      onClick={() => onAiModeChange(true)}
                    >
                      <span className={styles.buttonLabel}>ON</span>
                      <span className={styles.buttonDesc}>Auto-fill with AI bots</span>
                    </button>
                  </div>
                </div>

                <div className={styles.actionSection}>
                  <ActionButton onClick={onCreateGame} enabled={!isExiting} text="CREATE GAME" />
                </div>

                {error && (
                  <div className={styles.errorBox}>
                    <span className={styles.errorPrompt}>ERROR:</span>
                    <span className={styles.errorText}>{error}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          <motion.div
            key="exit-dot"
            className={styles.backgroundDot}
            initial={{ opacity: 0 }}
            exit={{
              opacity: 1,
              transition: {
                duration: 1,
                ease: [0, 1, 1, 1] as const,
              },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const CreateGamePageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const { mutate: createNewGame } = useCreateNewGame();
  const navigate = useNavigate();

  const [gameType, setGameType] = useState<GameType>(GAME_TYPE.SINGLE_DEVICE);
  const [gameFormat, setGameFormat] = useState<GameFormat>(GAME_FORMAT.QUICK);
  const [aiMode, setAiMode] = useState<boolean>(false);

  const handleCreateGame = () => {
    setIsExiting(true);

    setTimeout(() => {
      createNewGame(
        { gameType, gameFormat, aiMode },
        {
          onSuccess: (newGameData) => {
            navigate(`/game/${newGameData.publicId}/lobby`);
          },
          onError: (err) => {
            console.error("Game creation error:", err);
            setIsExiting(false);
            setError("Failed to create a new game. Please try again.");
          },
        },
      );
    }, 1000);
  };

  return (
    <CreateGamePageView
      isExiting={isExiting}
      gameType={gameType}
      gameFormat={gameFormat}
      aiMode={aiMode}
      error={error}
      onGameTypeChange={setGameType}
      onGameFormatChange={setGameFormat}
      onAiModeChange={setAiMode}
      onCreateGame={handleCreateGame}
    />
  );
};

export default CreateGamePageContent;
