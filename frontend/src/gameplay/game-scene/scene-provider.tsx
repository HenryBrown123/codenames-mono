/**
 * Player Scene Provider
 *
 * Provides scene state and transitions for the current player's turn
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from "react";
import { useGameDataRequired } from "../game-data/providers";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { getStateMachine } from "./scene-config";
import { useViewMode } from "../game-board/view-mode";

export interface PlayerSceneContextValue {
  currentRole: string;
  currentScene: string;
  triggerSceneTransition: (event: string) => void;
}

export const PlayerSceneContext = createContext<PlayerSceneContextValue | undefined>(undefined);

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

  // During SETUP phase, everyone is NONE (no roles assigned yet)
  const roundStatus = gameData.currentRound?.status;
  const currentRole = roundStatus === "SETUP"
    ? PLAYER_ROLE.NONE
    : (gameData.playerContext?.role || PLAYER_ROLE.NONE);

  const { setViewMode } = useViewMode();

  const stateMachine = useMemo(() => getStateMachine(currentRole), [currentRole]);
  const [currentScene, setCurrentScene] = useState<string>(stateMachine.initial);

  // Reset viewMode to normal on scene changes
  useEffect(() => {
    setViewMode("normal");
  }, [currentScene, setViewMode]);

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
