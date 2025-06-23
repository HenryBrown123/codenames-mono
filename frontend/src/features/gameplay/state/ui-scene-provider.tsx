import React, {
  useContext,
  createContext,
  ReactNode,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from "react";
import { PlayerRole, PLAYER_ROLE, GAME_TYPE } from "@codenames/shared/types";
import { useGameData } from "./game-data-provider";
import { useTurn } from "./active-turn-provider";
import { uiReducer, createInitialUIState } from "./ui-state-helpers";
import { determineUIStage } from "./ui-state-config";

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
  const { activeTurn } = useTurn();
  const [wasHidden, setWasHidden] = useState(false);

  const [uiState, dispatch] = useReducer(
    (state: UIState, action: any) =>
      uiReducer(state, action, gameData, activeTurn),
    gameData,
    createInitialUIState,
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

  // Track when page becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWasHidden(true); // Mark as "disconnected"
      } else if (wasHidden && gameData.gameType === GAME_TYPE.SINGLE_DEVICE) {
        // Page became visible again after being hidden - force handoff
        dispatch({
          type: "FORCE_HANDOFF",
          payload: { targetStage: uiState.currentStage },
        });
        setWasHidden(false);
      }
    };
    console.log(
      new Date(),
      "Running useEffect visibility listner, was hidden",
      wasHidden,
    );

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [wasHidden, gameData.gameType]);

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
