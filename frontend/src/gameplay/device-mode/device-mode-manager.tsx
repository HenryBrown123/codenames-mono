import React, { useCallback, ReactNode, useEffect, useRef, useState } from "react";
import { usePlayerContext, useTurn } from "../game-data/providers";
import { GameData } from "@frontend/shared-types";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { useAiStatus } from "@frontend/ai/api";
import { usePlayersQuery } from "../game-data/queries";
import { useStartTurnMutation } from "../game-actions/api/use-start-turn";
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
    // Note: no bail on activeTurn?.status === "ACTIVE" — that reads stale React Query cache.
    // By the time the 2s poll detects thinking:false, the server has already completed the turn.
    // Let startTurn hit the API directly; the server is the source of truth.
    if (startTurn.isPending) return;

    const anyPlayer = players?.find((p) => p.publicId);
    if (!anyPlayer) return;

    const roundNumber = gameData.currentRound?.roundNumber ?? 1;
    startTurn.mutate({ roundNumber, playerId: anyPlayer.publicId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiThinking]);

  // In single-device mode, clear currentPlayerId when the active turn changes, completes,
  // or gains a clue (codemaster → codebreaker phase transition within the same turn).
  // TurnDataProvider falls back to the last turn's ID even after it completes, so watching
  // activeTurnId alone misses the END TURN case — we must also watch status.
  // hasClue catches the mid-turn handoff: codemaster gives clue → AI/human codebreaker takes over.
  const activeTurnId = activeTurn?.id;
  const activeTurnStatus = activeTurn?.status;
  const hasClue = !!activeTurn?.clue;
  useEffect(() => {
    if (!gameData.playerContext && currentPlayerId) {
      setCurrentPlayerId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurnId, activeTurnStatus, hasClue]);

  const requiresHandoff =
    gameData.currentRound?.status === "IN_PROGRESS" &&
    (gameData.playerContext?.role || PLAYER_ROLE.NONE) === PLAYER_ROLE.NONE &&
    !currentPlayerId;

  // Delay showing the handoff overlay to let card animations settle first.
  const HANDOFF_DELAY_MS = 1_000;
  const [handoffReady, setHandoffReady] = useState(false);
  useEffect(() => {
    if (!requiresHandoff) { setHandoffReady(false); return; }
    const t = setTimeout(() => setHandoffReady(true), HANDOFF_DELAY_MS);
    return () => clearTimeout(t);
  }, [requiresHandoff]);

  const handleHandoffComplete = useCallback(
    (playerId: string) => setCurrentPlayerId(playerId),
    [setCurrentPlayerId],
  );

  return (
    <>
      {children}
      {handoffReady && aiStatus?.available && (
        <AiTurnOverlay gameData={gameData} />
      )}
      {handoffReady && !aiStatus?.available && !aiStatus?.thinking && (
        <DeviceHandoffOverlay gameData={gameData} onContinue={handleHandoffComplete} />
      )}
    </>
  );
};
