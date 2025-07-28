import { ReactNode } from "react";
import { GameDataProvider, useGameData } from "../shared/providers/game-data-provider";
import { TurnDataProvider } from "../shared/providers";
import { PlayerSceneProvider } from "../player-scenes";
import { GameActionsProvider } from "../player-actions/game-actions-provider";
import { PlayerProvider } from "../shared/providers/player-context-provider";
import { DeviceModeManager } from "../device-mode";
import { ActionButton } from "../shared/components/action-button";
import { GameData } from "@frontend/shared-types";
import { GAME_TYPE } from "@codenames/shared/types";
import styles from "./gameplay.module.css";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}


/**
 * Main gameplay provider that sets up the correct dependency hierarchy:
 * Player Context → Data → Turn → Scene Management → Actions → UI
 */
export const GameplayProvider = ({ gameId, children }: GameplayProviderProps) => {
  return (
    <PlayerProvider>
      <GameDataProvider gameId={gameId}>
        <ActiveGameProviders gameId={gameId}>{children}</ActiveGameProviders>
      </GameDataProvider>
    </PlayerProvider>
  );
};

/**
 * Providers that require game data to be loaded
 */
const ActiveGameProviders = ({ gameId, children }: GameplayProviderProps) => {
  const { gameData, isPending, isError, error, refetch } = useGameData();

  // Show skeleton during initial load
  if (!gameData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.boardGrid} style={{ opacity: 0.5 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className={styles.emptyCard}
              style={{
                animation: `pulse 2s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <h2>Failed to load game</h2>
        <p>{error?.message || "Unknown error"}</p>
        <ActionButton onClick={refetch} text="Retry" enabled={true} />
      </div>
    );
  }

  // Now we have gameData for sure
  return (
    <TurnDataProvider>
      <GameplaySceneProvider gameId={gameId} gameData={gameData}>
        <GameActionsProvider>{children}</GameActionsProvider>
      </GameplaySceneProvider>
    </TurnDataProvider>
  );
};

interface GameplaySceneProviderProps {
  gameId: string;
  gameData: GameData;
  children: ReactNode;
}

/**
 * Device mode wrapper that handles both single and multi-device games
 */
const GameplaySceneProvider = ({ children, gameData }: GameplaySceneProviderProps) => {
  if (gameData.gameType === GAME_TYPE.SINGLE_DEVICE) {
    return <DeviceModeManager gameData={gameData}>{children}</DeviceModeManager>;
  }

  return <PlayerSceneProvider>{children}</PlayerSceneProvider>;
};
