import { ReactNode } from "react";
import { GameDataProvider, useGameData } from "../game-data";
import { TurnProvider } from "../turn-management";
import { PlayerSceneProvider } from "../role-scenes";
import { GameActionsProvider } from "../game-actions";
import { PlayerProvider } from "../player-context/player-context.provider";
import { SingleDeviceManager } from "../single-device";
import styled from "styled-components";
import { ActionButton } from "../shared";
import { GameData } from "@frontend/shared-types";
import { GAME_TYPE } from "@codenames/shared/types";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  max-width: 600px;
  max-height: 600px;
  margin: auto;
`;

const EmptyCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 2rem;
  text-align: center;
  color: white;
`;

/**
 * Main gameplay provider that sets up the correct dependency hierarchy:
 * Player Context → Data → Turn → Scene Management → Actions → UI
 */
export const GameplayProvider = ({ gameId, children }: GameplayProviderProps) => {
  return (
    <PlayerProvider>
      <GameDataProvider gameId={gameId}>
        <GameplayContent gameId={gameId}>{children}</GameplayContent>
      </GameDataProvider>
    </PlayerProvider>
  );
};

/**
 * Inner component that can use the game data hook
 */
const GameplayContent = ({ gameId, children }: GameplayProviderProps) => {
  const { gameData, isPending, isError, error, refetch } = useGameData();

  // Show skeleton during initial load
  if (!gameData) {
    return (
      <LoadingContainer>
        <BoardGrid style={{ opacity: 0.5 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <EmptyCard
              key={`skeleton-${i}`}
              style={{
                animation: `pulse 2s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </BoardGrid>
      </LoadingContainer>
    );
  }

  // Show error state
  if (isError) {
    return (
      <ErrorContainer>
        <h2>Failed to load game</h2>
        <p>{error?.message || "Unknown error"}</p>
        <ActionButton onClick={refetch} text="Retry" enabled={true} />
      </ErrorContainer>
    );
  }

  // Now we have gameData for sure
  return (
    <TurnProvider>
      <GameplaySceneProvider gameId={gameId} gameData={gameData}>
        <GameActionsProvider>{children}</GameActionsProvider>
      </GameplaySceneProvider>
    </TurnProvider>
  );
};

interface GameplaySceneProviderProps {
  gameId: string;
  gameData: GameData;
  children: ReactNode;
}

/**
 * Scene wrapper that conditionally uses SingleDeviceManager for single-device games
 */
const GameplaySceneProvider = ({ children, gameData }: GameplaySceneProviderProps) => {
  console.log("[GameplaySceneProvider] running with", gameData);
  if (gameData.gameType === GAME_TYPE.SINGLE_DEVICE) {
    return <SingleDeviceManager gameData={gameData}>{children}</SingleDeviceManager>;
  }

  return <PlayerSceneProvider>{children}</PlayerSceneProvider>;
};
