import React, { useContext, createContext, ReactNode } from "react";
import styled from "styled-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameDataQuery } from "../api/queries";
import { GameData } from "@frontend/shared-types";
import { usePlayerContext } from "../player-context/player-context.provider";

interface GameDataContextValue {
  gameData: GameData;
  gameId: string;
  isRefetching: boolean;
}

const GameDataContext = createContext<GameDataContextValue | null>(null);

interface GameDataProviderProps {
  children: ReactNode;
  gameId: string;
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #4dabf7;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 2rem;
`;

const ErrorCard = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: #ef4444;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

export const GameDataProvider = ({ children, gameId }: GameDataProviderProps) => {
  const gameDataQuery = useGameDataQuery(gameId);

  // Initial loading state - no data yet (not even placeholder)
  if (gameDataQuery.isLoading && !gameDataQuery.data && !gameDataQuery.isPlaceholderData) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading game...</LoadingText>
      </LoadingContainer>
    );
  }

  // Error state
  if (gameDataQuery.isError) {
    return (
      <ErrorContainer>
        <ErrorCard>
          <ErrorTitle>Failed to Load Game</ErrorTitle>
          <ErrorMessage>
            {gameDataQuery.error?.message || "An unexpected error occurred"}
          </ErrorMessage>
          <RetryButton onClick={() => gameDataQuery.refetch()}>Retry</RetryButton>
        </ErrorCard>
      </ErrorContainer>
    );
  }

  // Data must exist at this point (either from initial load or cache)
  if (!gameDataQuery.data) {
    // This shouldn't happen, but TypeScript doesn't know that
    throw new Error("Game data is unexpectedly undefined");
  }

  // Normal state - we have data (either fresh or cached)
  // During refetch, gameDataQuery.data still contains previous data
  // while gameDataQuery.isFetching is true
  return (
    <GameDataContext.Provider
      value={{
        gameData: gameDataQuery.data,
        gameId,
        isRefetching: gameDataQuery.isFetching,
      }}
    >
      {children}
    </GameDataContext.Provider>
  );
};

/**
 * Hook to access game data from context
 * GUARANTEED to return GameData, never null or undefined
 */
export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error("useGameData must be used within GameDataProvider");
  }
  return context;
};
