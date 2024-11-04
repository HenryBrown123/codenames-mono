import React, { useContext, createContext, ReactNode } from "react";
import { useGameData } from "@game/api";
import { GameData } from "@game/game-common-types"; 

/** 
 * Main game context hook, providing game state managed by React context.
 * 
 * @returns {GameData | null} - The current game data from context, or null if no game data is available.
 */
export const GameContext = createContext<GameData | null>(null);

interface GameContextProviderProps {
  children: ReactNode;
  value: GameData;
}

/** 
 * GameContextProvider component to wrap around the application's component tree.
 * It uses the useGameData hook to fetch game data and provides it to the GameContext.
 * 
 * @param {GameContextProviderProps} props - The children components to be wrapped by the provider.
 * @returns {JSX.Element} - The GameContext provider with the fetched game data.
 */
export const GameContextProvider = ({ children }: GameContextProviderProps): JSX.Element => {
  const { data: game } = useGameData();
  return <GameContext.Provider value={game}> {children} </GameContext.Provider>;
};

/** 
 * Dedicated useContext hook for use by child components to access the GameContext.
 * 
 * @returns {GameData | null} - The current game data from context, or null if no game data is available.
 */
export const useGameContext = (): GameData | null => {
  return useContext(GameContext);
};
