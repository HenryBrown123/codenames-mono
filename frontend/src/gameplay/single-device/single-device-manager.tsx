import React, { useCallback, ReactNode } from "react";
import { usePlayerContext } from "../shared/providers/player-context-provider";
import { useTurn } from "../shared/providers/turn-data-provider";
import { GameData } from "@frontend/shared-types";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { PlayerSceneProvider } from "../player-scenes";
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
 * - Clears player context after players turn is over
 * - Ensures smooth transitions in local play
 *
 */
export const SingleDeviceManager: React.FC<SingleDeviceManagerProps> = ({ children, gameData }) => {
  const { currentPlayerId, setCurrentPlayerId } = usePlayerContext();
  const { clearActiveTurn } = useTurn();

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
