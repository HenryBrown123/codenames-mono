import React, { useCallback, ReactNode } from "react";
import { usePlayerContext } from "../player-context/player-context.provider";
import { useTurn } from "../turn-management";
import { GameData } from "@frontend/shared-types";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { PlayerSceneProvider } from "../role-scenes";
import { DeviceHandoffOverlay } from "../device-handoff";

interface SingleDeviceManagerProps {
  children: ReactNode;
  gameData: GameData;
}

/**
 * Single Device Manager
 *
 * Manages the pass-and-play flow for single-device games:
 * - Detects when device handoff is needed
 * - Shows handoff overlay between players
 * - Clears player context after turns
 * - Ensures smooth transitions in local play
 *
 * Only used when gameType === SINGLE_DEVICE
 */
export const SingleDeviceManager: React.FC<SingleDeviceManagerProps> = ({ children, gameData }) => {
  const { currentPlayerId, setCurrentPlayerId } = usePlayerContext();
  const { clearActiveTurn } = useTurn();

  console.log(
    "[SingleDeviceManager] running singledevice manager with ",
    currentPlayerId,
    gameData,
  );

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
