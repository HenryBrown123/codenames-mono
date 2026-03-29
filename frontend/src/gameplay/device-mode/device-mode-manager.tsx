import React, { useCallback, ReactNode, useEffect } from "react";
import { usePlayerContext } from "../game-data/providers";
import { GameData } from "@frontend/shared-types";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { useAiStatus } from "@frontend/ai/api";
import { DeviceHandoffOverlay } from "./device-handoff-overlay";
import { AiTurnOverlay } from "./ai-turn-overlay";

interface DeviceModeManagerProps {
  children: ReactNode;
  gameData: GameData;
}

/**
 * Manages single-device handoff flow.
 *
 * Three states when a handoff is needed:
 *   available  → AiTurnOverlay: "AI TURN" card, EXECUTE triggers the move
 *   thinking   → no overlay; header shows "AI IS THINKING..." instead
 *   neither    → DeviceHandoffOverlay: pass the device to the next human player
 */
export const DeviceModeManager: React.FC<DeviceModeManagerProps> = ({ children, gameData }) => {
  const { currentPlayerId, setCurrentPlayerId } = usePlayerContext();
  const { data: aiStatus } = useAiStatus(gameData.publicId);

  // In multi-device mode, sync currentPlayerId from playerContext
  const publicId = gameData.playerContext?.publicId;
  useEffect(() => {
    if (publicId && currentPlayerId !== publicId) {
      setCurrentPlayerId(publicId);
    }
  }, [publicId, currentPlayerId, setCurrentPlayerId]);

  const requiresHandoff =
    gameData.currentRound?.status === "IN_PROGRESS" &&
    (gameData.playerContext?.role || PLAYER_ROLE.NONE) === PLAYER_ROLE.NONE &&
    !currentPlayerId;

  const handleHandoffComplete = useCallback(
    (playerId: string) => setCurrentPlayerId(playerId),
    [setCurrentPlayerId],
  );

  return (
    <>
      {children}
      {requiresHandoff && aiStatus?.available && (
        <AiTurnOverlay gameData={gameData} />
      )}
      {requiresHandoff && !aiStatus?.available && !aiStatus?.thinking && (
        <DeviceHandoffOverlay gameData={gameData} onContinue={handleHandoffComplete} />
      )}
    </>
  );
};
