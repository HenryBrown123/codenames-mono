import { ReactNode } from "react";
import { GameDataProvider, useGameData } from "./game-data-provider";
import { TurnDataProvider } from "./turn-data-provider";
import { GameActionsProvider } from "../dashboard/game-actions-provider";
import { ActiveGameSessionProvider } from "./active-game-session-provider";
import { DeviceModeManager } from "../single-device";
import { ActionButton } from "../shared/components/action-button";
import { GameData } from "@frontend/shared/types";
import { ViewModeProvider } from "../board/view-mode";
import { TrackedAnimationProvider } from "../board/tracked-animation-context";
import { NotFoundScene } from "@frontend/app/scene-flow/not-found-scene";
import { isAxiosError } from "axios";
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
      <ActiveGameSessionProvider>
        <GameDataProvider gameId={gameId}>
          <ActiveGameProviders gameId={gameId}>{children}</ActiveGameProviders>
        </GameDataProvider>
      </ActiveGameSessionProvider>
    </ViewModeProvider>
  );
};

/**
 * Providers that require game data to be loaded
 */
const ActiveGameProviders = ({ gameId, children }: GameplayProviderProps) => {
  const { gameData, isPending, isError, error, refetch } = useGameData();

  if (isError) {
    const is404 = isAxiosError(error) && error.response?.status === 404;
    if (is404) {
      return <NotFoundScene />;
    }
    return (
      <div className={styles.errorContainer}>
        <h2>Failed to load game</h2>
        <p>{error?.message || "Unknown error"}</p>
        <ActionButton onClick={refetch} text="Retry" enabled={true} />
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={`${styles.boardGrid} ${styles.skeletonGrid}`}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className={`${styles.emptyCard} ${styles.skeletonCard}`}
              style={{ "--skeleton-delay": `${i * 0.05}s` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TurnDataProvider>
      <TrackedAnimationProvider>
        <GameplaySceneProvider gameId={gameId} gameData={gameData}>
          <GameActionsProvider>{children}</GameActionsProvider>
        </GameplaySceneProvider>
      </TrackedAnimationProvider>
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
  /** DeviceModeManager handles both single and multi-device games */
  return <DeviceModeManager gameData={gameData}>{children}</DeviceModeManager>;
};
