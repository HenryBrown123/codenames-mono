import { useContext, createContext, ReactNode } from "react";
import { useGameDataQuery } from "../api/use-game-query";
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
