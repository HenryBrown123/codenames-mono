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
 * When no current player is set and a round is in progress, shows an overlay:
 * - AI turn  → AiTurnOverlay (trigger button / thinking state, no device passing)
 * - Human turn → DeviceHandoffOverlay (pass the device to the next player)
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

  const isAiTurn = aiStatus?.available || aiStatus?.thinking;

  const handleHandoffComplete = useCallback(
    (playerId: string) => {
      setCurrentPlayerId(playerId);
    },
    [setCurrentPlayerId],
  );

  return (
    <>
      {children}
      {requiresHandoff && isAiTurn && <AiTurnOverlay gameData={gameData} />}
      {requiresHandoff && !isAiTurn && (
        <DeviceHandoffOverlay gameData={gameData} onContinue={handleHandoffComplete} />
      )}
    </>
  );
};
