import { useContext, createContext, ReactNode } from "react";
import { GameData } from "@codenames/shared/src/types/game-types";

/**
 * GameContextProvider component to wrap around the application's component tree.
 * It uses the useGameData hook to fetch game data and provides it to the GameContext.
 *
 * @param {GameContextProviderProps} props - The children components to be wrapped by the provider.
 * @returns {JSX.Element} - The GameContext provider with the fetched game data.
 */
export const GameContextProvider = ({
  children,
  value,
}: GameContextProviderProps): JSX.Element => {
  return (
    <GameContext.Provider value={value}> {children} </GameContext.Provider>
  );
};

/**
 * Dedicated useContext hook for use by child components to access the GameContext.
 *
 * @returns {GameData | null} - The current game data from context, or null if no game data is available.
 */
export const useGameContext = (): GameContextProps | null => {
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
