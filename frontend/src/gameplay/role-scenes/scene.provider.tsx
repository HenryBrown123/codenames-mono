/**
 * Player Scene Provider
 *
 * Orchestrates the UI flow for each player's turn in Codenames, managing scene
 * transitions and handoffs between players in single-device mode.
 *
 * Domain Concepts:
 * - Each player turn follows a scene-based flow (e.g., give clue → wait → outcome)
 * - Scenes are grouped by player role (Codemaster, Codebreaker, None)
 * - When a turn ends, the game transitions to the next active player
 *
 * Single-Device Flow:
 * 1. Player completes their turn → scene reaches END state
 * 2. Provider triggers onTurnComplete callback
 * 3. Parent clears player context → game returns to NONE state
 * 4. Handoff UI shows next active player
 * 5. Player selection → new turn begins with appropriate scene
 *
 * Multi-Device Flow:
 * - Each device maintains its own player context
 * - END transitions reset to initial scene (no handoff needed)
 *
 * This provider works with:
 * - PlayerProvider: Manages current player identity
 * - GameDataProvider: Supplies game state and player role
 * - GameActionsProvider: Handles player actions that trigger scene changes
 */

import React, {
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useState,
  useRef,
  useMemo,
} from "react";
import { useGameDataRequired } from "../game-data/game-data.provider";
import { usePlayerContext } from "../player-context/player-context.provider";
import { PLAYER_ROLE, GAME_TYPE, PlayerRole } from "@codenames/shared/types";
import { getStateMachine } from "./scene-config";

interface PlayerSceneContextValue {
  currentRole: string;
  currentScene: string;
  requiresHandoff: boolean;
  triggerSceneTransition: (event: string) => void;
  completeHandoff: (playerId: string) => void;
  isInitialScene: boolean;
}

const PlayerSceneContext = createContext<PlayerSceneContextValue | undefined>(undefined);

interface PlayerSceneProviderProps {
  children: ReactNode;
  onTurnComplete?: () => void;
}

export const PlayerSceneProvider: React.FC<PlayerSceneProviderProps> = ({
  children,
  onTurnComplete,
}) => {
  const { gameData } = useGameDataRequired();
  const { setCurrentPlayerId } = usePlayerContext();

  // Get current role from game data
  const currentRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;

  // Track the role and scene together
  const [roleScene, setRoleScene] = useState(() => {
    const stateMachine = getStateMachine(currentRole);
    return {
      role: currentRole,
      scene: stateMachine.initial,
    };
  });

  // If role changed, update state (but not during render)
  React.useEffect(() => {
    if (roleScene.role !== currentRole) {
      console.log(
        `[SCENE] Role changed from ${roleScene.role} to ${currentRole}, resetting to initial scene`,
      );
      const stateMachine = getStateMachine(currentRole);
      setRoleScene({
        role: currentRole,
        scene: stateMachine.initial,
      });
    }
  }, [currentRole, roleScene.role]);

  // Get the state machine for the current role
  const stateMachine = useMemo(() => getStateMachine(roleScene.role), [roleScene.role]);

  // Determine handoff requirement
  const requiresHandoff =
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE &&
    gameData.currentRound?.status === "IN_PROGRESS" &&
    currentRole === PLAYER_ROLE.NONE;

  /**
   * Triggers scene transitions and handles turn completion
   * END transitions invoke the onTurnComplete callback
   */
  const triggerSceneTransition = useCallback(
    (event: string) => {
      console.log(
        `[SCENE] triggerSceneTransition: ${event}, role: ${roleScene.role}, scene: ${roleScene.scene}`,
      );

      const currentSceneConfig = stateMachine.scenes[roleScene.scene];
      const transition = currentSceneConfig?.on?.[event];

      if (!transition) {
        console.log(`[SCENE] No transition found for event: ${event}`);
        return;
      }

      console.log(`[SCENE] Found transition type: ${transition.type}`);

      // Turn completion (END) triggers callback to parent
      if (transition.type === "END") {
        console.log(`[SCENE] Triggering onTurnComplete callback`);
        onTurnComplete?.();
        return;
      }

      // Scene transitions update state
      if (transition.type === "scene" && transition.target) {
        console.log(`[SCENE] Transitioning to scene: ${transition.target}`);
        setRoleScene((prev) => ({
          ...prev,
          scene: transition.target!,
        }));
      }
    },
    [roleScene, stateMachine, onTurnComplete],
  );

  /**
   * Completes device handoff by setting the new active player
   * This cascades through React Query to reset the scene state
   */
  const completeHandoff = useCallback(
    (playerId: string) => {
      console.log(`[SCENE] completeHandoff called with playerId: ${playerId}`);
      setCurrentPlayerId(playerId);
    },
    [setCurrentPlayerId],
  );

  // Determine if at the initial scene for current role
  const isInitialScene = roleScene.scene === stateMachine.initial;

  const contextValue: PlayerSceneContextValue = {
    currentRole: roleScene.role,
    currentScene: roleScene.scene,
    requiresHandoff,
    triggerSceneTransition,
    completeHandoff,
    isInitialScene,
  };

  console.log(contextValue);

  return <PlayerSceneContext.Provider value={contextValue}>{children}</PlayerSceneContext.Provider>;
};

export const usePlayerScene = (): PlayerSceneContextValue => {
  const context = useContext(PlayerSceneContext);
  if (context === undefined) {
    throw new Error("usePlayerScene must be used within PlayerSceneProvider");
  }
  return context;
};
