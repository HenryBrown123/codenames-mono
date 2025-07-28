import React, { useState } from "react";
import { useCreateNewGame } from "@frontend/game-access/api/query-hooks/use-create-new-game";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner, ActionButton } from "@frontend/gameplay/shared/components";
import {
  GAME_TYPE,
  GAME_FORMAT,
  GameType,
  GameFormat,
} from "@codenames/shared/types";
import styles from "./create-game-page-content.module.css";

const CreateGamePageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { mutate: createNewGame, isPending: isCreatingGame } =
    useCreateNewGame();
  const navigate = useNavigate();

  // Game settings - simplified to match backend
  const [gameType, setGameType] = useState<GameType>(GAME_TYPE.SINGLE_DEVICE);
  const [gameFormat, setGameFormat] = useState<GameFormat>(GAME_FORMAT.QUICK);

  const handleCreateGame = () => {
    const payload = {
      gameType,
      gameFormat,
    };

    createNewGame(payload, {
      onSuccess: (newGameData) => {
        navigate(`/game/${newGameData.publicId}/lobby`);
      },
      onError: (err) => {
        console.error("Game creation error:", err);
        setError("Failed to create a new game. Please try again.");
      },
    });
  };

  const getButtonThemeClass = (gameType: GameType, gameFormat: GameFormat, currentType: GameType | GameFormat) => {
    if (currentType === GAME_TYPE.SINGLE_DEVICE) return 'primary';
    if (currentType === GAME_TYPE.MULTI_DEVICE) return 'secondary';
    if (currentType === GAME_FORMAT.QUICK) return 'team1';
    if (currentType === GAME_FORMAT.BEST_OF_THREE) return 'team2';
    return 'primary';
  };

  return (
    <div className={styles.createGameLayout}>
      <div className={styles.gameContainer}>
        <div className={styles.welcomeContainer}>
          <h2>Welcome to Codenames!</h2>
          <p>
            Codenames is a word association game where players split into two
            teams and take turns giving clues to identify their team's secret
            words while avoiding the assassin. It's a game of strategy, wit, and
            deduction!
          </p>

          <div className={styles.settingsContainer}>
            <div className={styles.settingItem}>
              <label>Game Type</label>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.button} ${styles.primary} ${
                    gameType === GAME_TYPE.SINGLE_DEVICE ? styles.selected : ''
                  }`}
                  onClick={() => setGameType(GAME_TYPE.SINGLE_DEVICE)}
                >
                  Single Device
                </button>
                <button
                  className={`${styles.button} ${styles.secondary} ${
                    gameType === GAME_TYPE.MULTI_DEVICE ? styles.selected : ''
                  }`}
                  onClick={() => setGameType(GAME_TYPE.MULTI_DEVICE)}
                >
                  Multi Device
                </button>
              </div>
            </div>

            <hr className="divider" />

            <div className={styles.settingItem}>
              <label>Game Format</label>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.button} ${styles.team1} ${
                    gameFormat === GAME_FORMAT.QUICK ? styles.selected : ''
                  }`}
                  onClick={() => setGameFormat(GAME_FORMAT.QUICK)}
                >
                  Quick
                </button>
                <button
                  className={`${styles.button} ${styles.team2} ${
                    gameFormat === GAME_FORMAT.BEST_OF_THREE ? styles.selected : ''
                  }`}
                  onClick={() => setGameFormat(GAME_FORMAT.BEST_OF_THREE)}
                >
                  Best of 3
                </button>
              </div>
            </div>

            <hr className="divider" />
          </div>

          {isCreatingGame ? (
            <LoadingSpinner displayText={"Creating Game..."} />
          ) : (
            <ActionButton
              onClick={handleCreateGame}
              enabled={!isCreatingGame}
              text={"Start New Game"}
            />
          )}
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CreateGamePageContent;

