import { useContext, createContext, ReactNode } from "react";
import { GameData } from "@frontend/shared-types";

/**
 * GameContextProvider component to wrap around the application's component tree.
 * It uses the useGameData hook to fetch game data and provides it to the GameContext.
 */
export const GameContextProvider = ({
  children,
  value,
}: GameContextProviderProps): JSX.Element => {
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * Dedicated useContext hook for use by child components to access the GameContext.
 */
export const useGameContext = (): GameContextProps => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameContextProvider");
  }
  return context;
};

export const GameContext = createContext<GameContextProps | null>(null);

interface GameContextProps {
  gameData: GameData;
}

interface GameContextProviderProps {
  children: ReactNode;
  value: GameContextProps;
}
