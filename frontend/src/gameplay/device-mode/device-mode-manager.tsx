import React, { useCallback, ReactNode, useEffect } from "react";
import { usePlayerContext, useTurn } from "../game-data/providers";
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
  const { activeTurn } = useTurn();

  // In multi-device mode, sync currentPlayerId from playerContext
  const publicId = gameData.playerContext?.publicId;
  useEffect(() => {
    if (publicId && currentPlayerId !== publicId) {
      setCurrentPlayerId(publicId);
    }
  }, [publicId, currentPlayerId, setCurrentPlayerId]);

  // In single-device mode, clear currentPlayerId when the active turn changes
  // so the next handoff fires for the incoming player
  const activeTurnId = activeTurn?.id;
  useEffect(() => {
    if (!gameData.playerContext && currentPlayerId) {
      setCurrentPlayerId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurnId]);

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
      {requiresHandoff && aiStatus !== undefined && !aiStatus.available && !aiStatus.thinking && (
        <DeviceHandoffOverlay gameData={gameData} onContinue={handleHandoffComplete} />
      )}
    </>
  );
};
