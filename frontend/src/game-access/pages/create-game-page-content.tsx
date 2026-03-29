import React, { useState } from "react";
import { ActionButton, ErrorBox, ToggleSwitch } from "@frontend/gameplay/shared/components";
import { GAME_TYPE, GAME_FORMAT, GameType, GameFormat } from "@codenames/shared/types";
import styles from "./create-game-page-content.module.css";

export interface CreateGameViewProps {
  onCreateGame: (gameType: string, gameFormat: string, aiMode: boolean) => void;
  error: string | null;
}

export const CreateGameView: React.FC<CreateGameViewProps> = ({
  onCreateGame,
  error,
}) => {
  const [gameType, setGameType] = useState<GameType>(GAME_TYPE.SINGLE_DEVICE);
  const [gameFormat, setGameFormat] = useState<GameFormat>(GAME_FORMAT.QUICK);
  const [aiMode, setAiMode] = useState(false);

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>NEW GAME</h1>
      </div>

      <div className={styles.terminalBox}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>GAME TYPE</span>
          </div>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.optionButton} ${
                gameType === GAME_TYPE.SINGLE_DEVICE ? styles.selected : ""
              }`}
              onClick={() => setGameType(GAME_TYPE.SINGLE_DEVICE)}
            >
              <span className={styles.buttonLabel}>SINGLE DEVICE</span>
              <span className={styles.buttonDesc}>Pass & play on one device</span>
            </button>
            <button
              className={`${styles.optionButton} ${
                gameType === GAME_TYPE.MULTI_DEVICE ? styles.selected : ""
              }`}
              onClick={() => setGameType(GAME_TYPE.MULTI_DEVICE)}
            >
              <span className={styles.buttonLabel}>MULTI DEVICE</span>
              <span className={styles.buttonDesc}>Each player on their device</span>
            </button>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.aiSection}>
          <div>
            <span className={styles.sectionTitle}>AI MODE</span>
            <div className={styles.aiDesc}>Empty slots filled with AI players</div>
          </div>
          <ToggleSwitch
            active={aiMode}
            onChange={() => setAiMode(!aiMode)}
          />
        </div>

        <div className={styles.actionSection}>
          <ActionButton
            onClick={() => onCreateGame(gameType, gameFormat, aiMode)}
            text="CREATE GAME"
          />
        </div>

        {error && <ErrorBox message={error} />}
      </div>
    </>
  );
};
