import React, {
  useContext,
  createContext,
  ReactNode,
  useReducer,
  useCallback,
} from "react";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { UIState, uiReducer, createInitialUIState } from "./ui-state-helpers";

interface UIStateContextProps {
  currentStage: PlayerRole;
  currentScene: string;
  showDeviceHandoff: boolean;
  pendingTransition: {
    stage: PlayerRole;
    scene: string;
  } | null;
  handleSceneTransition: (event: string) => void;
  setUIStage: (stage: PlayerRole) => void;
  completeHandoff: () => void;
}

interface UIStateProviderProps {
  children: ReactNode;
  gameData: GameData;
}

const UIStateContext = createContext<UIStateContextProps | null>(null);

/**
 * UI State Provider - manages scene transitions and stage changes with device handoff
 */
export const UIStateProvider = ({
  children,
  gameData,
}: UIStateProviderProps): JSX.Element => {
  const [uiState, dispatch] = useReducer(
    (state: UIState, action: any) => uiReducer(state, action, gameData),
    createInitialUIState(gameData),
  );

  const handleSceneTransition = useCallback((event: string) => {
    dispatch({
      type: "TRIGGER_TRANSITION",
      payload: { event },
    });
  }, []);

  const setUIStage = useCallback((stage: PlayerRole) => {
    dispatch({
      type: "SET_STAGE",
      payload: { stage },
    });
  }, []);

  const completeHandoff = useCallback(() => {
    dispatch({
      type: "COMPLETE_HANDOFF",
    });
  }, []);

  return (
    <UIStateContext.Provider
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
    </UIStateContext.Provider>
  );
};

/**
 * Hook to access UI state context
 */
export const useUIState = (): UIStateContextProps => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error("useUIState must be used within a UIStateProvider");
  }
  return context;
};
