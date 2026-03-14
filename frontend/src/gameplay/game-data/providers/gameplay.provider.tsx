import { ReactNode } from "react";
import { GameDataProvider, useGameData } from "./game-data-provider";
import { TurnDataProvider } from "./turn-data-provider";
import { GameActionsProvider } from "../../game-actions/game-actions-provider";
import { PlayerProvider } from "./player-context-provider";
import { DeviceModeManager } from "../../device-mode";
import { ActionButton } from "../../shared/components/action-button";
import { GameData } from "@frontend/shared-types";
import { ViewModeProvider } from "../../game-board/view-mode";
import styles from "./gameplay.module.css";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}


/**
 * Main gameplay provider that sets up the correct dependency hierarchy:
 * Player Context → Data → Turn → Device Mode → Actions → UI
 */
export const GameplayProvider = ({ gameId, children }: GameplayProviderProps) => {
  return (
    <ViewModeProvider>
      <PlayerProvider>
        <GameDataProvider gameId={gameId}>
          <ActiveGameProviders gameId={gameId}>{children}</ActiveGameProviders>
        </GameDataProvider>
      </PlayerProvider>
    </ViewModeProvider>
  );
};

/**
 * Providers that require game data to be loaded
 */
const ActiveGameProviders = ({ gameId, children }: GameplayProviderProps) => {
  const { gameData, isPending, isError, error, refetch } = useGameData();

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

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <h2>Failed to load game</h2>
        <p>{error?.message || "Unknown error"}</p>
        <ActionButton onClick={refetch} text="Retry" enabled={true} />
      </div>
    );
  }

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
  // DeviceModeManager handles both single and multi-device games
  return <DeviceModeManager gameData={gameData}>{children}</DeviceModeManager>;
};
