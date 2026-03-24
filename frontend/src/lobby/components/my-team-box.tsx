import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamSymbol } from "../team-symbol";
import { getTeamConfig, getOppositeTeam, type TeamName } from "@frontend/shared-types";
import styles from "../lobby.module.css";

/**
 * Shows the current player's team assignment with animated team switching (multi-device mode)
 */

const TIMINGS = {
  BOX_ENTER: 0.3,
  CONTENT_FADE: 0.2,
  TEAM_SWITCH: 0.3,
  CONTENT_DELAY_SHORT: 0.05,
  CONTENT_DELAY_MEDIUM: 0.1,
} as const;

const EASING = [0.4, 0, 0.2, 1] as const;

/** Display state for the current player's team assignment box */
export interface MyTeamBoxData {
  teamName: TeamName;
  playerName: string;
  playersNeeded: number;
  disabled: boolean;
}

/** Callback for switching to the other team */
export interface MyTeamBoxHandlers {
  onSwitchTeam: () => void;
}

/** Full props for the team assignment box */
export type MyTeamBoxViewProps = MyTeamBoxData & MyTeamBoxHandlers;

export const MyTeamBoxView: React.FC<MyTeamBoxViewProps> = ({
  teamName,
  playerName,
  playersNeeded,
  onSwitchTeam,
  disabled = false,
}) => {
  const teamConfig = getTeamConfig(teamName);
  const teamColor = teamConfig.cssVar;
  const otherTeamName = getOppositeTeam(teamName);
  const otherTeamColor = otherTeamName ? getTeamConfig(otherTeamName).cssVar : "#6b7280";

  return (
    <motion.div
      layoutId="player-control-container"
      className={styles.myTeamBox}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        borderColor: teamColor,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: TIMINGS.BOX_ENTER,
        ease: EASING,
        borderColor: { duration: TIMINGS.TEAM_SWITCH, ease: EASING },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`team-content-${teamName}`}
          className={styles.teamContentRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TIMINGS.TEAM_SWITCH, ease: EASING }}
        >
          <TeamSymbol
            teamName={teamName}
            teamColor={teamColor}
            className={styles.bigTeamSymbol}
          />
          <div className={styles.teamInfoSection}>
            <div className={styles.teamName} style={{ "--symbol-color": teamColor } as React.CSSProperties}>
              {teamConfig.shortName}
            </div>
            <div className={styles.playerLabel}>{playerName}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key="status-section"
          className={styles.statusSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: TIMINGS.CONTENT_FADE,
            delay: TIMINGS.CONTENT_DELAY_SHORT,
            ease: EASING,
          }}
        >
          <div className={styles.waitingMessage}>Waiting for other players to join...</div>
          <div className={styles.playerCount}>
            {playersNeeded > 0 ? `${playersNeeded} more players required` : "Ready to start!"}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`switch-button-${teamName}`}
          className={styles.switchButtonContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: TIMINGS.TEAM_SWITCH,
            delay: TIMINGS.CONTENT_DELAY_MEDIUM,
            ease: EASING,
          }}
        >
          {otherTeamName && (
            <TeamSymbol
              teamName={otherTeamName}
              teamColor={otherTeamColor}
              className={styles.switchSymbol}
              onClick={disabled ? undefined : onSwitchTeam}
              isButton={!disabled}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
