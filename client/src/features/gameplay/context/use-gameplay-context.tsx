import React, { useContext, createContext, ReactNode, useReducer } from "react";
import { Stage } from "@game/game-common-types";

export const GameplayContext = createContext<GameplayContextProps | null>(null);

/**
 * GameplayContextProvider component to wrap around the application's component tree.
 * It provides the current gameplay state and dispatch function to its children.
 *
 * @param {GameplayProviderProps} props - The children components and current game stage.
 * @returns {JSX.Element} - The GameplayContext provider with the reducer state and dispatch function.
 */
export const GameplayContextProvider = ({
  children,
  currentGameStage,
}: GameplayProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    currentStage: currentGameStage,
  });

  if (state.currentStage !== currentGameStage) {
    dispatch({ type: "NEW_STAGE", newStage: currentGameStage });
  }

  return (
    <GameplayContext.Provider
      value={{
        currentStage: state.currentStage,
        currentSceneIndex: state.currentSceneIndex,
        dispatch,
      }}
    >
      {children}
    </GameplayContext.Provider>
  );
};

/**
 * Custom hook to access the GameplayContext.
 *
 * @returns {GameplayContextProps} - The current gameplay state and dispatch function from context.
 * @throws {Error} - If used outside of a GameplayProvider.
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

type GameplayAction =
  | { type: "NEW_STAGE"; newStage: Stage }
  | { type: "NEXT_SCENE" };

interface GameplayScene {
  currentStage: Stage;
  currentSceneIndex: number;
}

interface GameplayContextProps {
  dispatch: React.Dispatch<GameplayAction>;
  currentStage: Stage;
  currentSceneIndex: number;
}

interface GameplayProviderProps {
  children: ReactNode;
  currentGameStage: Stage;
}

const initialState: GameplayScene = {
  currentStage: null,
  currentSceneIndex: 0,
};

const gameReducer = (
  state: GameplayScene,
  action: GameplayAction
): GameplayScene => {
  switch (action.type) {
    case "NEW_STAGE":
      return {
        currentStage: action.newStage,
        currentSceneIndex: 0,
      };
    case "NEXT_SCENE":
      return {
        ...state,
        currentSceneIndex: state.currentSceneIndex + 1,
      };
    default:
      return state;
  }
};
