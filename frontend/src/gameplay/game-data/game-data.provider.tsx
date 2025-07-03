import React, { useContext, createContext, ReactNode } from "react";
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

export const GameDataProvider = ({
  children,
  gameId,
}: GameDataProviderProps) => {
  const gameDataQuery = useGameDataQuery(gameId);

  // Just provide the query state - no UI decisions!
  return (
    <GameDataContext.Provider
      value={{
        gameData: gameDataQuery.data,
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
