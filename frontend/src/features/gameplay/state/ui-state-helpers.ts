import { PlayerRole, PLAYER_ROLE, GAME_TYPE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { uiConfig, TransitionConfig } from "./ui-state-config";
import { conditions } from "./ui-state-mappings";

/**
 * UI State management types
 */
export interface UIState {
  currentStage: PlayerRole;
  currentScene: string;
  showDeviceHandoff: boolean;
  pendingTransition: {
    stage: PlayerRole;
    scene: string;
  } | null;
}

export type UIAction =
  | { type: "TRIGGER_TRANSITION"; payload: { event: string } }
  | { type: "SET_STAGE"; payload: { stage: PlayerRole } }
  | { type: "COMPLETE_HANDOFF" };

interface StageConfig {
  initial: string;
  scenes: Record<string, any>;
}

/**
 * Determines if a role transition requires device handoff in single device mode
 */
const requiresDeviceHandoff = (
  currentStage: PlayerRole,
  nextStage: PlayerRole,
  gameData: GameData,
): boolean => {
  // Only for single device games
  if (gameData.gameType !== GAME_TYPE.SINGLE_DEVICE) {
    return false;
  }

  // Only if actually changing roles
  if (currentStage === nextStage) {
    return false;
  }

  // Only if transitioning to an active player role
  if (nextStage === PLAYER_ROLE.NONE || nextStage === PLAYER_ROLE.SPECTATOR) {
    return false;
  }

  return true;
};

/**
 * Determines the player role for a given scene
 */
const determineRoleForScene = (
  stage: PlayerRole,
  scene: string,
): PlayerRole => {
  // Scene doesn't change the role, role is determined by stage
  return stage;
};

/**
 * Finds the matching transition based on event and conditions
 */
const findMatchingTransition = (
  transitions: TransitionConfig | TransitionConfig[],
  gameData: GameData,
): TransitionConfig | null => {
  if (Array.isArray(transitions)) {
    return (
      transitions.find((t) => {
        if (!t.condition) return true;

        // Handle array of conditions (all must be true)
        if (Array.isArray(t.condition)) {
          return t.condition.every((cond) => conditions[cond]?.(gameData));
        }

        // Handle single condition
        return conditions[t.condition]?.(gameData);
      }) || null
    );
  }

  if (transitions.type === "scene" || transitions.type === "role") {
    // Check single transition condition
    if (!transitions.condition) return transitions;

    if (Array.isArray(transitions.condition)) {
      return transitions.condition.every((cond) => conditions[cond]?.(gameData))
        ? transitions
        : null;
    }

    return conditions[transitions.condition]?.(gameData) ? transitions : null;
  }

  return null;
};

/**
 * Validates if a scene target exists in the stage config
 */
const isValidSceneTarget = (
  stageConfig: StageConfig,
  target: string,
): boolean => {
  return Boolean(stageConfig.scenes[target]);
};

/**
 * Handles scene transition logic with device handoff support
 */
const handleSceneTransition = (
  state: UIState,
  event: string,
  gameData: GameData,
): UIState => {
  const currentStageConfig = uiConfig[state.currentStage];
  if (!currentStageConfig) return state;

  const currentSceneConfig = currentStageConfig.scenes[state.currentScene];
  const transitions = currentSceneConfig?.on?.[event];

  if (!transitions) return state;

  const matchingTransition = findMatchingTransition(transitions, gameData);

  if (!matchingTransition) return state;

  // Handle role transitions
  if (matchingTransition.type === "role") {
    let nextStage: PlayerRole;

    // Handle special "serverRole" target
    if (matchingTransition.target === "serverRole") {
      nextStage = gameData.playerContext?.role || PLAYER_ROLE.NONE;
    } else {
      nextStage = matchingTransition.target as PlayerRole;
    }

    const nextStageConfig = uiConfig[nextStage];
    if (!nextStageConfig) return state;

    const nextScene = nextStageConfig.initial || "main";

    // Check if device handoff is needed for role transition
    if (requiresDeviceHandoff(state.currentStage, nextStage, gameData)) {
      return {
        ...state,
        showDeviceHandoff: true,
        pendingTransition: {
          stage: nextStage,
          scene: nextScene,
        },
      };
    }

    // Direct role transition
    return {
      ...state,
      currentStage: nextStage,
      currentScene: nextScene,
    };
  }

  // Handle scene transitions
  if (
    matchingTransition.type === "scene" &&
    isValidSceneTarget(currentStageConfig, matchingTransition.target as string)
  ) {
    const nextScene = matchingTransition.target as string;
    const nextStage = state.currentStage; // Scene transitions don't change stage

    // Check if device handoff is needed (shouldn't be for scene transitions, but just in case)
    if (requiresDeviceHandoff(state.currentStage, nextStage, gameData)) {
      return {
        ...state,
        showDeviceHandoff: true,
        pendingTransition: {
          stage: nextStage,
          scene: nextScene,
        },
      };
    }

    // Normal scene transition
    return {
      ...state,
      currentScene: nextScene,
    };
  }

  return state;
};

/**
 * Handles stage change logic with device handoff support
 */
const handleStageChange = (
  state: UIState,
  newStage: PlayerRole,
  gameData: GameData,
): UIState => {
  const newStageConfig = uiConfig[newStage];
  if (!newStageConfig) return state;

  const newScene = newStageConfig.initial || "main";

  // Check if device handoff is needed for stage change
  if (requiresDeviceHandoff(state.currentStage, newStage, gameData)) {
    return {
      ...state,
      showDeviceHandoff: true,
      pendingTransition: {
        stage: newStage,
        scene: newScene,
      },
    };
  }

  // Normal stage transition
  return {
    currentStage: newStage,
    currentScene: newScene,
    showDeviceHandoff: false,
    pendingTransition: null,
  };
};

/**
 * Handles completion of device handoff
 */
const handleHandoffComplete = (state: UIState): UIState => {
  if (!state.pendingTransition) return state;

  return {
    currentStage: state.pendingTransition.stage,
    currentScene: state.pendingTransition.scene,
    showDeviceHandoff: false,
    pendingTransition: null,
  };
};

/**
 * Creates initial UI state from game data
 */
export const createInitialUIState = (gameData?: GameData): UIState => ({
  currentStage: gameData?.playerContext.role || PLAYER_ROLE.NONE,
  currentScene:
    uiConfig[gameData?.playerContext.role || PLAYER_ROLE.NONE]?.initial ||
    "main",
  showDeviceHandoff: false,
  pendingTransition: null,
});

/**
 * UI reducer with integrated device handoff support
 */
export const uiReducer = (
  state: UIState,
  action: UIAction,
  gameData: GameData,
): UIState => {
  switch (action.type) {
    case "TRIGGER_TRANSITION":
      return handleSceneTransition(state, action.payload.event, gameData);

    case "SET_STAGE":
      return handleStageChange(state, action.payload.stage, gameData);

    case "COMPLETE_HANDOFF":
      return handleHandoffComplete(state);

    default:
      return state;
  }
};
