import React, {
  useContext,
  createContext,
  ReactNode,
  useReducer,
  useCallback,
} from "react";
import { PlayerRole } from "@codenames/shared/types";
import { useGameData } from "./game-data-provider";
import { uiReducer, createInitialUIState } from "./ui-state-helpers";

interface UIState {
  currentStage: PlayerRole;
  currentScene: string;
  showDeviceHandoff: boolean;
  pendingTransition: {
    stage: PlayerRole;
    scene: string;
  } | null;
}

interface UISceneContextValue {
  currentStage: PlayerRole;
  currentScene: string;
  showDeviceHandoff: boolean;
  pendingTransition: UIState["pendingTransition"];
  handleSceneTransition: (event: string) => void;
  setUIStage: (stage: PlayerRole) => void;
  completeHandoff: () => void;
}

const UISceneContext = createContext<UISceneContextValue | null>(null);

interface UISceneProviderProps {
  children: ReactNode;
}

export const UISceneProvider = ({ children }: UISceneProviderProps) => {
  const { gameData } = useGameData();

  const [uiState, dispatch] = useReducer(
    (state: UIState, action: any) => uiReducer(state, action, gameData, null),
    createInitialUIState(gameData),
  );

  const handleSceneTransition = useCallback((event: string) => {
    dispatch({ type: "TRIGGER_TRANSITION", payload: { event } });
  }, []);

  const setUIStage = useCallback((stage: PlayerRole) => {
    dispatch({ type: "SET_STAGE", payload: { stage } });
  }, []);

  const completeHandoff = useCallback(() => {
    dispatch({ type: "COMPLETE_HANDOFF" });
  }, []);

  return (
    <UISceneContext.Provider
      value={{
        currentStage: uiState.currentStage,
        currentScene: uiState.currentScene,
        showDeviceHandoff: uiState.showDeviceHandoff,
        pendingTransition: uiState.pendingTransition,
        handleSceneTransition,
        setUIStage,
        completeHandoff,
      }}
    >
      {children}
    </UISceneContext.Provider>
  );
};

/**
 * Hook to access UI scene state and actions
 */
export const useUIScene = () => {
  const context = useContext(UISceneContext);
  if (!context) {
    throw new Error("useUIScene must be used within UISceneProvider");
  }
  return context;
};
