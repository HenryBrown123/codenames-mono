import React, { useCallback, ReactNode, useEffect, useRef } from "react";
import { usePlayerContext, useTurn } from "../game-data/providers";
import { GameData } from "@frontend/shared-types";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { useAiStatus } from "@frontend/ai/api";
import { usePlayersQuery } from "../game-data/queries";
import { useStartTurnMutation } from "../game-actions/api/use-start-turn";
import { useTrackedAnimation } from "../game-board/tracked-animation-context";
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
  const { data: players } = usePlayersQuery(gameData.publicId);
  const startTurn = useStartTurnMutation(gameData.publicId);
  const wasThinking = useRef(false);
  const { isAnimating } = useTrackedAnimation();

  // In multi-device mode, sync currentPlayerId from playerContext
  const publicId = gameData.playerContext?.publicId;
  useEffect(() => {
    if (publicId && currentPlayerId !== publicId) {
      setCurrentPlayerId(publicId);
    }
  }, [publicId, currentPlayerId, setCurrentPlayerId]);

  // Auto-advance to the next turn after AI finishes guessing (single-device mode only).
  // When thinking transitions true → false with no active turn, fire startTurn automatically
  // using any human player's ID so the backend can authorise the request.
  const aiThinking = aiStatus?.thinking ?? false;
  useEffect(() => {
    const justFinished = wasThinking.current && !aiThinking;
    wasThinking.current = aiThinking;

    if (!justFinished) return;
    if (gameData.playerContext) return; // multi-device: human handles this
    if (activeTurn?.status === "ACTIVE") return; // turn still running
    if (startTurn.isPending) return;

    const anyPlayer = players?.find((p) => p.publicId);
    if (!anyPlayer) return;

    const roundNumber = gameData.currentRound?.roundNumber ?? 1;
    startTurn.mutate({ roundNumber, playerId: anyPlayer.publicId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiThinking]);

  // In single-device mode, clear currentPlayerId when the active turn changes OR completes.
  // TurnDataProvider falls back to the last turn's ID even after it completes, so watching
  // activeTurnId alone misses the END TURN case — we must also watch status.
  const activeTurnId = activeTurn?.id;
  const activeTurnStatus = activeTurn?.status;
  useEffect(() => {
    if (!gameData.playerContext && currentPlayerId) {
      setCurrentPlayerId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurnId, activeTurnStatus]);

  // Auto-advance to the next turn when a human turn completes in single-device mode.
  // (AI turns are handled by the aiThinking effect above.)
  useEffect(() => {
    if (activeTurnStatus !== "COMPLETED") return;
    if (gameData.playerContext) return; // multi-device: not our job
    if (aiThinking) return; // AI finishing will handle this via the aiThinking effect
    if (!gameData.currentRound || gameData.currentRound.status !== "IN_PROGRESS") return;
    if (startTurn.isPending) return;

    const anyPlayer = players?.find((p) => p.publicId);
    if (!anyPlayer) return;

    startTurn.mutate({ roundNumber: gameData.currentRound.roundNumber, playerId: anyPlayer.publicId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurnStatus]);

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
      {requiresHandoff && !isAnimating && aiStatus?.available && (
        <AiTurnOverlay gameData={gameData} />
      )}
      {requiresHandoff && !isAnimating && aiStatus !== undefined && !aiStatus.available && !aiStatus.thinking && (
        <DeviceHandoffOverlay gameData={gameData} onContinue={handleHandoffComplete} />
      )}
    </>
  );
};
