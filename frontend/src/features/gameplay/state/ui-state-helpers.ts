import { PlayerRole, PLAYER_ROLE, GAME_TYPE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { TurnData } from "../api/queries/use-turn-query";
import {
  uiConfig,
  TransitionConfig,
  determineUIStage,
} from "./ui-state-config";
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
 * Condition evaluation with comprehensive logging and negation support
 */
const evaluateCondition = (
  conditionKey: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): boolean => {
  // Handle negated conditions
  if (conditionKey.startsWith("!")) {
    const baseCondition = conditionKey.slice(1);
    const conditionFunc = conditions[baseCondition];
    if (!conditionFunc) {
      console.warn(
        `[STATE_MACHINE] Unknown condition: ${baseCondition} (from negated ${conditionKey})`,
      );
      return false;
    }
    const result = !conditionFunc(gameData, activeTurn);
    console.log(
      `[STATE_MACHINE] Condition "${conditionKey}": ${result} (negated ${baseCondition})`,
    );
    return result;
  }

  const conditionFunc = conditions[conditionKey];
  if (!conditionFunc) {
    console.warn(`[STATE_MACHINE] Unknown condition: ${conditionKey}`);
    return false;
  }

  const result = conditionFunc(gameData, activeTurn);
  console.log(`[STATE_MACHINE] Condition "${conditionKey}": ${result}`);
  return result;
};

/**
 * Find matching transition with detailed decision logging
 */
const findMatchingTransition = (
  transitions: TransitionConfig | TransitionConfig[],
  gameData: GameData,
  activeTurn: TurnData | null,
): TransitionConfig | null => {
  console.log(`[STATE_MACHINE] Evaluating transitions:`, transitions);

  if (Array.isArray(transitions)) {
    console.log(
      `[STATE_MACHINE] Checking ${transitions.length} transition options`,
    );

    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i];
      console.log(`[STATE_MACHINE] Option ${i + 1}:`, transition);

      if (transition.condition) {
        const conditionsArray = Array.isArray(transition.condition)
          ? transition.condition
          : [transition.condition];

        console.log(
          `[STATE_MACHINE] Evaluating conditions: ${conditionsArray.join(", ")}`,
        );

        const results = conditionsArray.map((conditionKey) => ({
          condition: conditionKey,
          result: evaluateCondition(conditionKey, gameData, activeTurn),
        }));

        const allPass = results.every((r) => r.result);

        if (allPass) {
          console.log(
            `[STATE_MACHINE] ✅ All conditions passed, selecting transition:`,
            transition,
          );
          return transition;
        } else {
          const failed = results
            .filter((r) => !r.result)
            .map((r) => r.condition);
          console.log(
            `[STATE_MACHINE] ❌ Failed conditions: ${failed.join(", ")}`,
          );
        }
      } else {
        console.log(
          `[STATE_MACHINE] ✅ No conditions, selecting unconditional transition:`,
          transition,
        );
        return transition;
      }
    }

    console.log(
      `[STATE_MACHINE] ❌ No matching transitions found, all options failed`,
    );
    return null;
  } else {
    console.log(`[STATE_MACHINE] Single transition option:`, transitions);

    if (transitions.condition) {
      const conditionKey = transitions.condition as string;
      const passes = evaluateCondition(conditionKey, gameData, activeTurn);

      if (passes) {
        console.log(
          `[STATE_MACHINE] ✅ Condition passed, selecting transition`,
        );
        return transitions;
      } else {
        console.log(`[STATE_MACHINE] ❌ Condition failed, no transition`);
        return null;
      }
    } else {
      console.log(
        `[STATE_MACHINE] ✅ No conditions, selecting unconditional transition`,
      );
      return transitions;
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
 * Scene transition handler with comprehensive logging
 */
const handleSceneTransition = (
  state: UIState,
  event: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): UIState => {
  console.log(
    `[STATE_MACHINE] Handling transition: event="${event}" from ${state.currentStage}/${state.currentScene}`,
  );

  const currentStageConfig = uiConfig[state.currentStage];
  if (!currentStageConfig) {
    console.warn(
      `[STATE_MACHINE] No config found for stage: ${state.currentStage}`,
    );
    return state;
  }

  const currentSceneConfig = currentStageConfig.scenes[state.currentScene];
  if (!currentSceneConfig) {
    console.warn(
      `[STATE_MACHINE] No config found for scene: ${state.currentScene}`,
    );
    return state;
  }

  const transitions = currentSceneConfig?.on?.[event];
  if (!transitions) {
    console.log(
      `[STATE_MACHINE] No transitions defined for event "${event}" in scene ${state.currentScene}`,
    );
    return state;
  }

  const matchingTransition = findMatchingTransition(
    transitions,
    gameData,
    activeTurn,
  );

  if (!matchingTransition) {
    console.log(
      `[STATE_MACHINE] No valid transition found, staying in current state`,
    );
    return state;
  }

  console.log(`[STATE_MACHINE] Executing transition:`, matchingTransition);

  // Handle role transitions
  if (matchingTransition.type === "role") {
    let nextStage: PlayerRole;

    if (matchingTransition.target === "serverRole") {
      nextStage = gameData.playerContext?.role || PLAYER_ROLE.NONE;
      console.log(
        `[STATE_MACHINE] Role transition to server role: ${nextStage}`,
      );
    } else {
      nextStage = matchingTransition.target as PlayerRole;
      console.log(`[STATE_MACHINE] Role transition to: ${nextStage}`);
    }

    const nextStageConfig = uiConfig[nextStage];
    if (!nextStageConfig) {
      console.warn(
        `[STATE_MACHINE] No config found for target stage: ${nextStage}`,
      );
      return state;
    }

    const nextScene = nextStageConfig.initial || "main";
    console.log(`[STATE_MACHINE] Initial scene for ${nextStage}: ${nextScene}`);

    // Check if device handoff is needed for role transition
    const needsHandoff = requiresDeviceHandoff(
      state.currentStage,
      nextStage,
      gameData,
    );
    if (needsHandoff) {
      console.log(
        `[STATE_MACHINE] Device handoff required for ${state.currentStage} → ${nextStage}`,
      );
      return {
        ...state,
        showDeviceHandoff: true,
        pendingTransition: { stage: nextStage, scene: nextScene },
      };
    }

    console.log(
      `[STATE_MACHINE] Direct role transition: ${state.currentStage}/${state.currentScene} → ${nextStage}/${nextScene}`,
    );
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
        `[STATE_MACHINE] Invalid scene target: ${nextScene} for stage: ${state.currentStage}`,
      );
      return state;
    }

    console.log(
      `[STATE_MACHINE] Scene transition: ${state.currentScene} → ${nextScene}`,
    );
    return {
      ...state,
      currentScene: nextScene,
      showDeviceHandoff: false,
      pendingTransition: null,
    };
  }

  console.warn(
    `[STATE_MACHINE] Unknown transition type: ${matchingTransition.type}`,
  );
  return state;
};

/**
 * Creates initial UI state with proper single device handoff behavior
 */
export const createInitialUIState = (gameData: GameData): UIState => {
  const playerRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;
  const targetStage = determineUIStage(
    gameData.status,
    playerRole,
    gameData.currentRound,
  );

  // Single device: always start neutral, then transition to role (triggers handoff)
  if (
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE &&
    targetStage !== PLAYER_ROLE.NONE
  ) {
    console.log(
      `[STATE_MACHINE] Single device init: starting at NONE with handoff to ${targetStage}`,
    );
    return {
      currentStage: PLAYER_ROLE.NONE,
      currentScene: "main",
      showDeviceHandoff: true,
      pendingTransition: {
        stage: targetStage,
        scene: uiConfig[targetStage]?.initial || "main",
      },
    };
  }

  // Multiplayer: direct initialization
  console.log(`[STATE_MACHINE] Direct init to: ${targetStage}/main`);
  return {
    currentStage: targetStage,
    currentScene: uiConfig[targetStage]?.initial || "main",
    showDeviceHandoff: false,
    pendingTransition: null,
  };
};

/**
 * UI state reducer with comprehensive logging
 */
export const uiReducer = (
  state: UIState,
  action: UIAction,
  gameData: GameData,
  activeTurn: TurnData | null,
): UIState => {
  console.log(`[STATE_MACHINE] Action dispatched:`, action);
  console.log(
    `[STATE_MACHINE] Current state: ${state.currentStage}/${state.currentScene}`,
  );

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
      console.log(`[STATE_MACHINE] Setting stage to: ${nextStage}`);

      const nextStageConfig = uiConfig[nextStage];

      if (!nextStageConfig) {
        console.warn(`[STATE_MACHINE] No config found for stage: ${nextStage}`);
        return state;
      }

      const nextScene = nextStageConfig.initial || "main";

      const needsHandoff = requiresDeviceHandoff(
        state.currentStage,
        nextStage,
        gameData,
      );
      if (needsHandoff) {
        console.log(
          `[STATE_MACHINE] Device handoff required for stage change: ${state.currentStage} → ${nextStage}`,
        );
        return {
          ...state,
          showDeviceHandoff: true,
          pendingTransition: { stage: nextStage, scene: nextScene },
        };
      }

      console.log(
        `[STATE_MACHINE] Direct stage change: ${state.currentStage}/${state.currentScene} → ${nextStage}/${nextScene}`,
      );
      return {
        ...state,
        currentStage: nextStage,
        currentScene: nextScene,
        showDeviceHandoff: false,
        pendingTransition: null,
      };
    }

    case "COMPLETE_HANDOFF":
      console.log(`[STATE_MACHINE] Completing handoff`);
      if (state.pendingTransition) {
        console.log(
          `[STATE_MACHINE] Applying pending transition: ${state.pendingTransition.stage}/${state.pendingTransition.scene}`,
        );
        return {
          ...state,
          currentStage: state.pendingTransition.stage,
          currentScene: state.pendingTransition.scene,
          showDeviceHandoff: false,
          pendingTransition: null,
        };
      }
      console.log(`[STATE_MACHINE] No pending transition to complete`);
      return state;

    default:
      console.warn(`[STATE_MACHINE] Unknown action type:`, action);
      return state;
  }
};
