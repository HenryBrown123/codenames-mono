import React from "react";
import { motion } from "framer-motion";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { getTeamConfig } from "@frontend/shared/types";
import type { TurnPhase } from "@frontend/shared/types";
import { ActionButton } from "@frontend/game/gameplay/shared/components";
import { pageContainerStyles } from "@frontend/game/gameplay/shared/components";
import styles from "./device-handoff-overlay.module.css";

const EASE = [0.4, 0, 0.2, 1] as const;

interface DeviceHandoffOverlayProps {
  active: TurnPhase;
  onAccept: () => void;
}

/**
 * Overlay prompting device handoff between players.
 *
 * Intentionally has NO internal visible/AnimatePresence logic.
 * The parent (DeviceModeManager) wraps this in AnimatePresence so
 * mounting/unmounting is driven purely by the handoffRequired flag.
 * onAccept is called immediately on button click — never on exit
 * animation complete — so it can't fire accidentally due to a
 * parent-driven unmount.
 */
export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  active,
  onAccept,
}) => {
  const teamConfig = getTeamConfig(active.teamName);
  const displayName = active.isAi
    ? active.teamName
    : active.role === PLAYER_ROLE.CODEMASTER
      ? (active.playerName ?? active.teamName)
      : `${active.teamName} Operatives`;

  return (
    <motion.div
      className={styles.overlayContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
    >
      <div className={styles.backgroundBlur} />

      <motion.div
        className={pageContainerStyles.card}
        style={{ maxWidth: 480 }}
        initial={{ scale: 0.85, y: 16 }}
        animate={{ scale: 1, y: 0, transition: { duration: 0.35, ease: EASE } }}
        exit={{ scale: 0, transition: { duration: 0.4, ease: EASE } }}
      >
        <h1 className={styles.title}>DEVICE HANDOFF</h1>

        <div
          className={styles.playerInfo}
          style={{ "--team-color": teamConfig.cssVar } as React.CSSProperties}
        >
          <div className={styles.playerName}>{displayName}</div>
          <div className={styles.roleLabel}>
            {teamConfig.symbol} {active.teamName}
            {active.role === PLAYER_ROLE.CODEMASTER && " · Spymaster"}
          </div>
        </div>

        <ActionButton
          id="handoff-execute-btn"
          text="EXECUTE"
          enabled={true}
          onClick={onAccept}
          fullWidth
        />
      </motion.div>
    </motion.div>
  );
};

export { DeviceHandoffOverlay as DeviceHandoffOverlayView };
