/**
 * Player Scene Provider
 *
 * Provides scene state and transitions for the current player's turn
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { useGameDataRequired } from "../shared/providers";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { getStateMachine } from "./scene-config";

interface PlayerSceneContextValue {
  currentRole: string;
  currentScene: string;
  triggerSceneTransition: (event: string) => void;
}

const PlayerSceneContext = createContext<PlayerSceneContextValue | undefined>(undefined);

interface PlayerSceneProviderProps {
  children: ReactNode;
  onTurnComplete?: () => void;
}

/**
 * Player Scene Provider
 *
 * Manages scene transitions for the current player's role.
 * Pure scene state management - no handoff or game type logic.
 *
 * Remounts automatically when role changes via key prop in parent.
 */
export const PlayerSceneProvider: React.FC<PlayerSceneProviderProps> = ({
  children,
  onTurnComplete,
}) => {
  const { gameData } = useGameDataRequired();
  const currentRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;

  const stateMachine = useMemo(() => getStateMachine(currentRole), [currentRole]);
  const [currentScene, setCurrentScene] = useState<string>(stateMachine.initial);

  const triggerSceneTransition = useCallback(
    (event: string) => {
      const transition = stateMachine.scenes[currentScene]?.on?.[event];
      if (!transition) {
        console.warn(`[PlayerSceneProvider] No transition found for event: ${event}`);
        return;
      }

      if (transition.type === "END") {
        onTurnComplete?.();
      } else if (transition.type === "scene" && transition.target) {
        setCurrentScene(transition.target);
      }
    },
    [currentScene, stateMachine, onTurnComplete],
  );

  const contextValue: PlayerSceneContextValue = {
    currentRole,
    currentScene,
    triggerSceneTransition,
  };

  return <PlayerSceneContext.Provider value={contextValue}>{children}</PlayerSceneContext.Provider>;
};

export const usePlayerScene = (): PlayerSceneContextValue => {
  const context = useContext(PlayerSceneContext);
  if (context === undefined) {
    throw new Error("usePlayerScene must be used within PlayerSceneProvider");
  }
  return context;
};
