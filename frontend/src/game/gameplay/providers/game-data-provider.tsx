import { useContext, createContext, ReactNode } from "react";
import { useGameDataQuery } from "../api/queries/use-game-query";
import { GameData } from "@frontend/shared/types";
import { useGameRoom, useWebSocketInvalidation } from "@frontend/shared/websocket";

/** Shape provided by {@link GameDataContext}. */
export interface GameDataContextValue {
  gameData: GameData | undefined;
  gameId: string;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/** Context for the per-game data query. Use {@link useGameData}. */
export const GameDataContext = createContext<GameDataContextValue | null>(null);

interface GameDataProviderProps {
  children: ReactNode;
  gameId: string;
}

/**
 * Provides the per-game data query (plus loading/error/refetch
 * helpers) and joins the websocket room for live invalidations.
 */
export const GameDataProvider = ({ children, gameId }: GameDataProviderProps) => {
  const gameDataQuery = useGameDataQuery(gameId);

  /** Enable real-time multiplayer updates via WebSocket */
  useGameRoom(gameId);
  useWebSocketInvalidation(gameId);

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
 * Subscribes to game data and query lifecycle flags. Throws if used
 * outside a `GameDataProvider`.
 */
export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error("useGameData must be used within GameDataProvider");
  }
  return context;
};

/**
 * Like {@link useGameData} but narrows `gameData` to non-undefined.
 *
 * Throws if data isn't yet loaded — callers must gate the subtree
 * behind `isPending` / `isError` first so the runtime check never
 * fires in practice.
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
