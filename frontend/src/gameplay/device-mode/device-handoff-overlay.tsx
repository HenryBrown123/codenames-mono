import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { getTeamConfig } from "@frontend/shared-types";
import { ActionButton } from "@frontend/gameplay/shared/components";
import { pageContainerStyles } from "@frontend/gameplay/shared/components";
import { usePlayersQuery } from "../game-data/queries";
import styles from "./device-handoff-overlay.module.css";

/**
 * Overlay prompting device handoff between players
 */

const EASE = [0.4, 0, 0.2, 1] as const;

export interface DeviceHandoffOverlayViewProps {
  displayName: string;
  teamColor: string;
  targetRole: PlayerRole;
  targetTeam: string;
  isReady: boolean;
  onContinue: () => void;
}

export const DeviceHandoffOverlayView: React.FC<DeviceHandoffOverlayViewProps> = ({
  displayName,
  teamColor,
  targetRole,
  targetTeam,
  isReady,
  onContinue,
}) => {
  const teamConfig = getTeamConfig(targetTeam);

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
          style={{ "--team-color": teamColor } as React.CSSProperties}
        >
          <div className={styles.playerName}>{displayName}</div>
          <div className={styles.roleLabel}>
            {teamConfig.symbol} {targetTeam}
            {targetRole === PLAYER_ROLE.CODEMASTER && " · Spymaster"}
          </div>
        </div>

        <ActionButton
          text={isReady ? "EXECUTE" : "LOADING..."}
          enabled={isReady}
          onClick={onContinue}
          fullWidth
        />
      </motion.div>
    </motion.div>
  );
};

interface DeviceHandoffOverlayProps {
  gameData: GameData;
  onContinue: (playerId: string) => void;
}

export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  gameData,
  onContinue,
}) => {
  const [visible, setVisible] = useState(true);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data: players } = usePlayersQuery(gameData.publicId);

  const nextPlayer = players?.find((p) => p.status === "ACTIVE");
  const isReady = !!nextPlayer;
  const targetRole = nextPlayer?.role || PLAYER_ROLE.NONE;
  const targetTeam = nextPlayer?.teamName || "Team";
  const teamConfig = getTeamConfig(targetTeam);
  const displayName = nextPlayer
    ? targetRole === PLAYER_ROLE.CODEMASTER
      ? nextPlayer.name
      : `${targetTeam} Operatives`
    : "LOADING...";

  const handleContinueClick = () => {
    if (nextPlayer) {
      setSelectedPlayerId(nextPlayer.publicId);
      setVisible(false);
    }
  };

  const handleExitComplete = () => {
    if (selectedPlayerId) onContinue(selectedPlayerId);
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <DeviceHandoffOverlayView
          displayName={displayName}
          teamColor={teamConfig.cssVar}
          targetRole={targetRole}
          targetTeam={targetTeam}
          isReady={isReady}
          onContinue={handleContinueClick}
        />
      )}
    </AnimatePresence>
  );
};
