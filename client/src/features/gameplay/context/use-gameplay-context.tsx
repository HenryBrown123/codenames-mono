import React, { useContext, createContext, ReactNode, useReducer } from "react";

/**
 * Reducer function to manage gameplay view state
 */
type GameAction = { type: "PAUSE_GAMEPLAY" } | { type: "START_GAMEPLAY" };

const gameReducer = (showGameplay: boolean, action: GameAction): boolean => {
  switch (action.type) {
    case "PAUSE_GAMEPLAY":
      return false;
    case "START_GAMEPLAY":
      return true;
    default:
      return showGameplay;
  }
};

/**
 * Main gameplay context hook, providing gameplay state managed by React context.
 *
 * @returns {React.Dispatch<GameAction>} - The dispatch function to control gameplay state.
 */
interface GameplayContextProps {
  dispatch: React.Dispatch<GameAction>;
  showGameplay: boolean;
}

export const GameplayContext = createContext<GameplayContextProps | null>(null);

interface GameplayProviderProps {
  children: ReactNode;
}

/**
 * GameplayProvider component to wrap around the application's component tree.
 * It uses the useReducer hook to manage gameplay state and provides dispatch and state to the GameplayContext.
 *
 * @param {GameplayProviderProps} props - The children components to be wrapped by the provider.
 * @returns {JSX.Element} - The GameplayContext provider with the reducer state and dispatch function.
 */
export const GameplayContextProvider = ({
  children,
}: GameplayProviderProps): JSX.Element => {
  const [showGameplay, dispatch] = useReducer(gameReducer, false);

  return (
    <GameplayContext.Provider value={{ showGameplay, dispatch }}>
      {children}
    </GameplayContext.Provider>
  );
};

/**
 * Dedicated useContext hook for use by child components to access the GameplayContext.
 *
 * @returns {GameplayContextProps} - The current gameplay state and dispatch function from context.
 */
export const useGameplayContext = (): GameplayContextProps => {
  const context = useContext(GameplayContext);
  if (!context) {
    throw new Error(
      "useGameplayContext must be used within a GameplayProvider"
    );
  }

  return context;
};
