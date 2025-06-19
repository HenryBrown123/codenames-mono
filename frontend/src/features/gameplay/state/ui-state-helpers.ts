import { PlayerRole, PLAYER_ROLE, GAME_TYPE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { TurnData } from "../api/queries/use-turn-query";
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
 * Condition evaluation with activeTurn support
 */
const evaluateCondition = (
  conditionKey: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): boolean => {
  const conditionFunc = conditions[conditionKey];
  if (!conditionFunc) {
    console.warn(`Unknown condition: ${conditionKey}`);
    return false;
  }

  return conditionFunc(gameData, activeTurn);
};

/**
 * Find matching transition with activeTurn support
 */
const findMatchingTransition = (
  transitions: TransitionConfig | TransitionConfig[],
  gameData: GameData,
  activeTurn: TurnData | null,
): TransitionConfig | null => {
  if (Array.isArray(transitions)) {
    for (const transition of transitions) {
      if (transition.condition) {
        const conditionsArray = Array.isArray(transition.condition)
          ? transition.condition
          : [transition.condition];

        const allPass = conditionsArray.every((conditionKey) =>
          evaluateCondition(conditionKey, gameData, activeTurn),
        );

        if (allPass) {
          return transition;
        }
      } else {
        return transition;
      }
    }

    return null;
  } else {
    const passes = transitions.condition
      ? evaluateCondition(transitions.condition as string, gameData, activeTurn)
      : true;

    return passes ? transitions : null;
  }
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
 * Scene transition handler with activeTurn support
 */
const handleSceneTransition = (
  state: UIState,
  event: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): UIState => {
  const currentStageConfig = uiConfig[state.currentStage];
  if (!currentStageConfig) {
    console.warn(`No config found for stage: ${state.currentStage}`);
    return state;
  }

  const currentSceneConfig = currentStageConfig.scenes[state.currentScene];
  if (!currentSceneConfig) {
    console.warn(`No config found for scene: ${state.currentScene}`);
    return state;
  }

  const transitions = currentSceneConfig?.on?.[event];
  if (!transitions) {
    return state;
  }

  const matchingTransition = findMatchingTransition(
    transitions,
    gameData,
    activeTurn,
  );

  if (!matchingTransition) {
    return state;
  }

  // Handle role transitions
  if (matchingTransition.type === "role") {
    let nextStage: PlayerRole;

    if (matchingTransition.target === "serverRole") {
      nextStage = gameData.playerContext?.role || PLAYER_ROLE.NONE;
    } else {
      nextStage = matchingTransition.target as PlayerRole;
    }

    const nextStageConfig = uiConfig[nextStage];
    if (!nextStageConfig) {
      console.warn(`No config found for target stage: ${nextStage}`);
      return state;
    }

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

    return {
      ...state,
      currentStage: nextStage,
      currentScene: nextScene,
      showDeviceHandoff: false,
      pendingTransition: null,
    };
  }

  // Handle scene transitions
  if (matchingTransition.type === "scene") {
    const nextScene = matchingTransition.target as string;

    if (!isValidSceneTarget(currentStageConfig, nextScene)) {
      console.warn(
        `Invalid scene target: ${nextScene} for stage: ${state.currentStage}`,
      );
      return state;
    }

    return {
      ...state,
      currentScene: nextScene,
      showDeviceHandoff: false,
      pendingTransition: null,
    };
  }

  console.warn(`Unknown transition type: ${matchingTransition.type}`);
  return state;
};

/**
 * Creates initial UI state based on game data
 */
export const createInitialUIState = (gameData: GameData): UIState => {
  const stage = gameData.playerContext?.role || PLAYER_ROLE.NONE;
  const stageConfig = uiConfig[stage];
  const initialScene = stageConfig?.initial || "main";

  return {
    currentStage: stage,
    currentScene: initialScene,
    showDeviceHandoff: false,
    pendingTransition: null,
  };
};

/**
 * UI state reducer with activeTurn support
 */
export const uiReducer = (
  state: UIState,
  action: UIAction,
  gameData: GameData,
  activeTurn: TurnData | null,
): UIState => {
  switch (action.type) {
    case "TRIGGER_TRANSITION":
      return handleSceneTransition(
        state,
        action.payload.event,
        gameData,
        activeTurn,
      );

    case "SET_STAGE": {
      const nextStage = action.payload.stage;
      const nextStageConfig = uiConfig[nextStage];

      if (!nextStageConfig) {
        console.warn(`No config found for stage: ${nextStage}`);
        return state;
      }

      const nextScene = nextStageConfig.initial || "main";

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

      return {
        ...state,
        currentStage: nextStage,
        currentScene: nextScene,
        showDeviceHandoff: false,
        pendingTransition: null,
      };
    }

    case "COMPLETE_HANDOFF":
      if (state.pendingTransition) {
        return {
          ...state,
          currentStage: state.pendingTransition.stage,
          currentScene: state.pendingTransition.scene,
          showDeviceHandoff: false,
          pendingTransition: null,
        };
      }
      return state;

    default:
      return state;
  }
};
