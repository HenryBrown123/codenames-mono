import React, { ReactNode, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { GAME_TYPE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared/types";
import { usePlayerSession } from "../providers/active-game-session-provider";
import { useTurn } from "../providers";
import { useViewMode } from "../board/view-mode/view-mode-context";
import { DeviceHandoffOverlay } from "./device-handoff-overlay";
import { AiTurnOverlay } from "./ai-turn-overlay";
import { needsHandoff } from "./device-mode.logic";

interface DeviceModeManagerProps {
  children: ReactNode;
  gameData: GameData;
}

/**
 * Manages device handoff for single-device games. Multi-device is a no-op —
 * the server resolves perspective from the JWT and the header always shows
 * playerContext.
 *
 * Single-device handoff rules:
 *   • Human turn, role or team changed → show handoff overlay
 *   • AI turn, team changed from claimed  → show AI turn overlay (pass device)
 *   • AI turn, same team as claimed       → no overlay (device already with this team)
 */
export const DeviceModeManager: React.FC<DeviceModeManagerProps> = ({
  children,
  gameData,
}) => {
  const { claimedPhase, setClaimedPhase, setIsAiClaimed } = usePlayerSession();
  const { activeTurn } = useTurn();
  const { setViewMode } = useViewMode();

  const active = activeTurn?.active ?? null;
  const isMultiDevice = gameData.gameType !== GAME_TYPE.SINGLE_DEVICE;

  // ---------------------------------------------------------------------------
  // Reset view mode whenever the active phase key changes (single-device only).
  // ---------------------------------------------------------------------------
  const prevActiveKeyRef = useRef<string>("");

  useEffect(() => {
    if (isMultiDevice) return;
    const key = active ? `${active.teamName}:${active.role}` : "";
    if (key !== prevActiveKeyRef.current) {
      prevActiveKeyRef.current = key;
      setViewMode("normal");
    }
  }, [isMultiDevice, active?.teamName, active?.role, setViewMode]);

  // ---------------------------------------------------------------------------
  // Derive what to show.
  // AI overlay only appears when the AI is playing for a DIFFERENT team —
  // same-team AI turns (e.g. human codemaster → AI codebreakers) are silent.
  // ---------------------------------------------------------------------------

  const handoffRequired = needsHandoff(active, claimedPhase, isMultiDevice);
  const isAiTurn =
    !isMultiDevice &&
    active?.isAi === true &&
    active.teamName !== claimedPhase?.teamName;

  // ---------------------------------------------------------------------------
  // Handoff accept — claim the active role+team, reset view
  // ---------------------------------------------------------------------------

  const handleHandoffAccept = useCallback(() => {
    if (active) {
      setClaimedPhase({ role: active.role, teamName: active.teamName });
      setIsAiClaimed(false);
      setViewMode("normal");
    }
  }, [active, setClaimedPhase, setIsAiClaimed, setViewMode]);

  // ---------------------------------------------------------------------------
  // AI turn pass — record that this AI team now has the device so same-team
  // follow-up AI turns don't re-show the overlay.
  // ---------------------------------------------------------------------------

  const handleAiPass = useCallback(() => {
    if (active) {
      setClaimedPhase({ role: active.role, teamName: active.teamName });
      setIsAiClaimed(true);
    }
  }, [active, setClaimedPhase, setIsAiClaimed]);

  return (
    <>
      {children}
      <AnimatePresence>
        {handoffRequired && active && (
          <DeviceHandoffOverlay
            key="handoff"
            active={active}
            onAccept={handleHandoffAccept}
          />
        )}
      </AnimatePresence>
      {isAiTurn && active && (
        <AiTurnOverlay key={activeTurn?.id} active={active} onPass={handleAiPass} />
      )}
    </>
  );
};
