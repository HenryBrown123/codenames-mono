import React, { useContext, createContext, ReactNode, useRef } from "react";
import { useGameDataQuery } from "../api/queries";
import { GameData } from "@frontend/shared-types";

interface GameDataContextValue {
  gameData: GameData | undefined;
  gameId: string;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

const GameDataContext = createContext<GameDataContextValue | null>(null);

interface GameDataProviderProps {
  children: ReactNode;
  gameId: string;
}

export const GameDataProvider = ({ children, gameId }: GameDataProviderProps) => {
  const gameDataQuery = useGameDataQuery(gameId);

  const cachedGameData = useRef<GameData | undefined>(undefined);

  // Update cache when we get new valid data
  if (gameDataQuery.data) {
    cachedGameData.current = gameDataQuery.data;
  }

  console.log("Cached data: ", cachedGameData.current);
  console.log("Query data: ", gameDataQuery.data);

  // Determine what game data to provide
  const gameData = gameDataQuery.data || cachedGameData.current;

  return (
    <GameDataContext.Provider
      value={{
        gameData: gameData,
        gameId,
        isPending: gameDataQuery.isPending,
        isError: gameDataQuery.isError,
        error: gameDataQuery.error,
        refetch: gameDataQuery.refetch,
        isFetching: gameDataQuery.isFetching,
      }}
    >
      {children}
    </GameDataContext.Provider>
  );
};

/**
 * Hook to access game data from context
 * Returns loading/error states along with data
 */
export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error("useGameData must be used within GameDataProvider");
  }
  return context;
};

/**
 * Hook that guarantees game data exists
 * Use in components that should only render when data is available
 */
export const useGameDataRequired = () => {
  const context = useGameData();
  if (!context.gameData) {
    throw new Error("Game data not available - check isPending before using this hook");
  }
  return {
    ...context,
    gameData: context.gameData,
  };
};
