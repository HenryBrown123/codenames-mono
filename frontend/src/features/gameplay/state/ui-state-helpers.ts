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
 * Enhanced logging for state machine condition evaluation
 */
const evaluateCondition = (
  conditionName: string,
  gameData: GameData,
): boolean => {
  const conditionFn = conditions[conditionName];
  if (!conditionFn) {
    console.warn(`[StateMachine] Unknown condition: ${conditionName}`);
    return false;
  }

  const result = conditionFn(gameData);
  console.log(`[StateMachine] Condition "${conditionName}": ${result}`);
  return result;
};

/**
 * Enhanced findMatchingTransition with detailed logging
 */
const findMatchingTransition = (
  transitions: TransitionConfig | TransitionConfig[],
  gameData: GameData,
  event: string,
  currentStage: PlayerRole,
  currentScene: string,
): TransitionConfig | null => {
  console.log(
    `[StateMachine] Finding transition for event "${event}" from ${currentStage}.${currentScene}`,
  );

  if (Array.isArray(transitions)) {
    console.log(
      `[StateMachine] Evaluating ${transitions.length} possible transitions`,
    );

    for (let i = 0; i < transitions.length; i++) {
      const t = transitions[i];
      console.log(
        `[StateMachine] Checking transition ${i + 1}/${transitions.length} (${t.type} -> ${t.target})`,
      );

      if (!t.condition) {
        console.log(`[StateMachine] ✓ No conditions - transition matches`);
        return t;
      }

      if (Array.isArray(t.condition)) {
        console.log(
          `[StateMachine] Evaluating ${t.condition.length} conditions (ALL must pass):`,
        );
        const allPass = t.condition.every((cond) =>
          evaluateCondition(cond, gameData),
        );

        if (allPass) {
          console.log(
            `[StateMachine] ✓ All conditions passed - transition matches`,
          );
          return t;
        } else {
          console.log(
            `[StateMachine] ✗ Some conditions failed - trying next transition`,
          );
        }
      } else {
        console.log(`[StateMachine] Evaluating single condition:`);
        const passes = evaluateCondition(t.condition, gameData);

        if (passes) {
          console.log(`[StateMachine] ✓ Condition passed - transition matches`);
          return t;
        } else {
          console.log(
            `[StateMachine] ✗ Condition failed - trying next transition`,
          );
        }
      }
    }

    console.log(`[StateMachine] ✗ No transitions matched for event "${event}"`);
    return null;
  }

  // Single transition case
  console.log(
    `[StateMachine] Evaluating single transition (${transitions.type} -> ${transitions.target})`,
  );

  if (!transitions.condition) {
    console.log(`[StateMachine] ✓ No conditions - transition matches`);
    return transitions;
  }

  if (Array.isArray(transitions.condition)) {
    console.log(
      `[StateMachine] Evaluating ${transitions.condition.length} conditions (ALL must pass):`,
    );
    const allPass = transitions.condition.every((cond) =>
      evaluateCondition(cond, gameData),
    );

    if (allPass) {
      console.log(
        `[StateMachine] ✓ All conditions passed - transition matches`,
      );
      return transitions;
    } else {
      console.log(`[StateMachine] ✗ Some conditions failed - no transition`);
      return null;
    }
  } else {
    console.log(`[StateMachine] Evaluating single condition:`);
    const passes = evaluateCondition(transitions.condition, gameData);

    if (passes) {
      console.log(`[StateMachine] ✓ Condition passed - transition matches`);
      return transitions;
    } else {
      console.log(`[StateMachine] ✗ Condition failed - no transition`);
      return null;
    }
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
 * Enhanced handleSceneTransition with detailed logging
 */
const handleSceneTransition = (
  state: UIState,
  event: string,
  gameData: GameData,
): UIState => {
  console.log(
    `[StateMachine] === TRANSITION ATTEMPT ===\n` +
      `Event: "${event}"\n` +
      `Current: ${state.currentStage}.${state.currentScene}\n` +
      `GameType: ${gameData.gameType}\n` +
      `PlayerRole: ${gameData.playerContext?.role}`,
  );

  const currentStageConfig = uiConfig[state.currentStage];
  if (!currentStageConfig) {
    console.warn(
      `[StateMachine] ✗ No config found for stage: ${state.currentStage}`,
    );
    return state;
  }

  const currentSceneConfig = currentStageConfig.scenes[state.currentScene];
  if (!currentSceneConfig) {
    console.warn(
      `[StateMachine] ✗ No config found for scene: ${state.currentScene}`,
    );
    return state;
  }

  const transitions = currentSceneConfig?.on?.[event];
  if (!transitions) {
    console.log(
      `[StateMachine] ✗ No transitions defined for event "${event}" in ${state.currentStage}.${state.currentScene}`,
    );
    return state;
  }

  const matchingTransition = findMatchingTransition(
    transitions,
    gameData,
    event,
    state.currentStage,
    state.currentScene,
  );

  if (!matchingTransition) {
    console.log(
      `[StateMachine] ✗ No matching transition found - staying in current state`,
    );
    return state;
  }

  console.log(
    `[StateMachine] ✓ Found matching transition: ${matchingTransition.type} -> ${matchingTransition.target}`,
  );

  // Handle role transitions
  if (matchingTransition.type === "role") {
    let nextStage: PlayerRole;

    if (matchingTransition.target === "serverRole") {
      nextStage = gameData.playerContext?.role || PLAYER_ROLE.NONE;
      console.log(`[StateMachine] Resolving "serverRole" to: ${nextStage}`);
    } else {
      nextStage = matchingTransition.target as PlayerRole;
    }

    const nextStageConfig = uiConfig[nextStage];
    if (!nextStageConfig) {
      console.warn(
        `[StateMachine] ✗ No config found for target stage: ${nextStage}`,
      );
      return state;
    }

    const nextScene = nextStageConfig.initial || "main";
    console.log(
      `[StateMachine] Role transition: ${state.currentStage}.${state.currentScene} -> ${nextStage}.${nextScene}`,
    );

    // Check if device handoff is needed for role transition
    if (requiresDeviceHandoff(state.currentStage, nextStage, gameData)) {
      console.log(
        `[StateMachine] ⏸️  Device handoff required - staging transition`,
      );
      return {
        ...state,
        showDeviceHandoff: true,
        pendingTransition: {
          stage: nextStage,
          scene: nextScene,
        },
      };
    }

    console.log(`[StateMachine] ✓ Direct role transition completed`);
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
    console.log(
      `[StateMachine] Scene transition: ${state.currentStage}.${state.currentScene} -> ${state.currentStage}.${nextScene}`,
    );

    // Check if device handoff is needed (shouldn't be for scene transitions, but defensive)
    if (
      requiresDeviceHandoff(state.currentStage, state.currentStage, gameData)
    ) {
      console.log(
        `[StateMachine] ⏸️  Device handoff required for scene transition - staging`,
      );
      return {
        ...state,
        showDeviceHandoff: true,
        pendingTransition: {
          stage: state.currentStage,
          scene: nextScene,
        },
      };
    }

    console.log(`[StateMachine] ✓ Scene transition completed`);
    return {
      ...state,
      currentScene: nextScene,
    };
  }

  console.warn(
    `[StateMachine] ✗ Invalid transition target: ${matchingTransition.target}`,
  );
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
  console.log(
    `[StateMachine] === STAGE CHANGE ===\nTarget: ${newStage}\nCurrent: ${state.currentStage}.${state.currentScene}`,
  );

  const newStageConfig = uiConfig[newStage];
  if (!newStageConfig) {
    console.warn(
      `[StateMachine] ✗ No config found for target stage: ${newStage}`,
    );
    return state;
  }

  const newScene = newStageConfig.initial || "main";

  // Check if device handoff is needed for stage change
  if (requiresDeviceHandoff(state.currentStage, newStage, gameData)) {
    console.log(`[StateMachine] ⏸️  Device handoff required - staging change`);
    return {
      ...state,
      showDeviceHandoff: true,
      pendingTransition: {
        stage: newStage,
        scene: newScene,
      },
    };
  }

  console.log(
    `[StateMachine] ✓ Direct stage change: ${state.currentStage}.${state.currentScene} -> ${newStage}.${newScene}`,
  );
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
  if (!state.pendingTransition) {
    console.warn(
      `[StateMachine] Handoff complete called but no pending transition`,
    );
    return state;
  }

  console.log(
    `[StateMachine] ✓ Handoff complete: ${state.currentStage}.${state.currentScene} -> ${state.pendingTransition.stage}.${state.pendingTransition.scene}`,
  );

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
export const createInitialUIState = (gameData?: GameData): UIState => {
  let lookupRole = gameData?.playerContext.role || PLAYER_ROLE.NONE;
  if (gameData?.currentRound?.status === "SETUP") {
    lookupRole = PLAYER_ROLE.NONE;
  }
  console.log("Initial UI stage: ", lookupRole);
  return {
    currentStage: lookupRole,
    currentScene: uiConfig[lookupRole]?.initial || "main",
    showDeviceHandoff: false,
    pendingTransition: null,
  };
};

/**
 * UI reducer with integrated device handoff support
 */
export const uiReducer = (
  state: UIState,
  action: UIAction,
  gameData: GameData,
): UIState => {
  console.log(`[StateMachine] === ACTION: ${action.type} ===`);

  switch (action.type) {
    case "TRIGGER_TRANSITION":
      return handleSceneTransition(state, action.payload.event, gameData);

    case "SET_STAGE":
      return handleStageChange(state, action.payload.stage, gameData);

    case "COMPLETE_HANDOFF":
      return handleHandoffComplete(state);

    default:
      console.warn(
        `[StateMachine] Unknown action type: ${(action as any).type}`,
      );
      return state;
  }
};
