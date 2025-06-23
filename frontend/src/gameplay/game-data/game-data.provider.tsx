import React, { useContext, createContext, ReactNode } from "react";
import { useGameDataQuery } from "../api/queries";
import { GameData } from "@frontend/shared-types";

interface GameDataContextValue {
  gameData: GameData;
  gameId: string;
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

  if (gameDataQuery.isPending) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading game...</div>
      </div>
    );
  }

  if (gameDataQuery.isError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Failed to load game</h2>
        <p>{gameDataQuery.error?.message || "Unknown error"}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <GameDataContext.Provider
      value={{
        gameData: gameDataQuery.data,
        gameId,
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
