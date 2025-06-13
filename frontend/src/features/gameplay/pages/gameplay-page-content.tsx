import React from "react";
import { useGameData } from "@frontend/game/api/use-game-data";
import {
  GameContextProvider,
  GameplayContextProvider,
} from "@frontend/game/state";
import { LoadingSpinner, GameScene } from "@frontend/game/ui";
import styled from "styled-components";

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 100vh;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  font-size: clamp(1rem, 2vw, 1.5rem);
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 100vh;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  font-size: clamp(1rem, 2vw, 1.5rem);
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

interface GameplayPageContentProps {
  gameId: string;
}

const GameplayPageContent: React.FC<GameplayPageContentProps> = ({
  gameId,
}) => {
  const {
    data: gameData,
    isLoading,
    isRefetching,
    error,
  } = useGameData(gameId);

  if (isLoading || isRefetching) {
    return (
      <LoadingContainer>
        <LoadingSpinner displayText="Loading..." />
      </LoadingContainer>
    );
  }

  if (error || !gameData) {
    return (
      <ErrorContainer>
        <h2>Something went wrong :(</h2>
        <p>Please try refreshing the page.</p>
        {error && <p>Error: {error.message}</p>}
      </ErrorContainer>
    );
  }

  return (
    <GameplayContextProvider gameId={gameId} gameData={gameData}>
      <GameContextProvider value={{ gameData }}>
        <GameScene />
      </GameContextProvider>
    </GameplayContextProvider>
  );
};

export default GameplayPageContent;
