import React, { useCallback, ReactNode, useEffect } from "react";
import { usePlayerContext, useTurn } from "../game-data/providers";
import { GameData } from "@frontend/shared-types";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { PlayerSceneProvider } from "../game-scene";
import { DeviceHandoffOverlay } from "./device-handoff-overlay";

interface DeviceModeManagerProps {
  children: ReactNode;
  gameData: GameData;
}

/**
 * Device Mode Manager
 *
 * Manages device-specific game flow for both single and multi-device games:
 * - For single-device: Shows handoff overlay between players
 * - For multi-device: Direct scene management without handoff
 * - Clears player context after turn completion
 * - Ensures smooth transitions across device modes
 */
export const DeviceModeManager: React.FC<DeviceModeManagerProps> = ({ children, gameData }) => {
  const { currentPlayerId, setCurrentPlayerId } = usePlayerContext();
  const { clearActiveTurn } = useTurn();

  // In multi-device mode, sync currentPlayerId with publicId from playerContext
  const publicId = gameData.playerContext?.publicId;
  useEffect(() => {
    if (publicId && currentPlayerId !== publicId) {
      setCurrentPlayerId(publicId);
    }
  }, [publicId, currentPlayerId, setCurrentPlayerId]);

  /**
   * Determines if handoff UI should be shown
   */
  const requiresHandoff =
    gameData.currentRound?.status === "IN_PROGRESS" &&
    (gameData.playerContext?.role || PLAYER_ROLE.NONE) === PLAYER_ROLE.NONE &&
    !currentPlayerId;

  /**
   * Handles turn completion - clears player for handoff
   */
  const handleTurnComplete = useCallback(() => {
    setCurrentPlayerId(null);
    clearActiveTurn();
  }, [setCurrentPlayerId, clearActiveTurn]);

  /**
   * Completes handoff by setting the new active player
   */
  const handleHandoffComplete = useCallback(
    (playerId: string) => {
      setCurrentPlayerId(playerId);
    },
    [setCurrentPlayerId],
  );

  return (
    <>
      <PlayerSceneProvider key={gameData.playerContext?.role} onTurnComplete={handleTurnComplete}>
        {children}
      </PlayerSceneProvider>
      {requiresHandoff && (
        <DeviceHandoffOverlay gameData={gameData} onContinue={handleHandoffComplete} />
      )}
    </>
  );
};
