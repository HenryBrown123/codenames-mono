import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeamConfig } from "@frontend/shared-types";
import styles from "../lobby.module.css";

/**
 * Form for new players to enter their name and choose a team to join (multi-device mode)
 */

/** Display state for the join area form */
export interface JoinAreaData {
  playerName: string;
  disabled: boolean;
}

/** Callbacks for name input and team selection */
export interface JoinAreaHandlers {
  onPlayerNameChange: (value: string) => void;
  onJoinRed: () => void;
  onJoinBlue: () => void;
}

/** Full props for the join area view */
export type JoinAreaViewProps = JoinAreaData & JoinAreaHandlers;

export const JoinAreaView: React.FC<JoinAreaViewProps> = ({
  playerName,
  onPlayerNameChange,
  onJoinRed,
  onJoinBlue,
  disabled = false,
}) => {
  const canJoin = playerName.trim().length > 0 && !disabled;
  const redConfig = getTeamConfig("Team Red");
  const blueConfig = getTeamConfig("Team Blue");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="join-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.joinContent}
      >
        <h2 className={styles.joinTitle}>Join the Mission</h2>
        <input
          className={styles.addInput}
          placeholder="Enter your operative name..."
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          disabled={disabled}
          autoFocus
        />

        <div className={styles.teamButtonsGrid}>
          <motion.button
            className={styles.joinTeamButton}
            style={{ "--team-color": redConfig.cssVar } as React.CSSProperties}
            onClick={onJoinRed}
            disabled={!canJoin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            JOIN TEAM {redConfig.shortName}
          </motion.button>
          <motion.button
            className={styles.joinTeamButton}
            style={{ "--team-color": blueConfig.cssVar } as React.CSSProperties}
            onClick={onJoinBlue}
            disabled={!canJoin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            JOIN TEAM {blueConfig.shortName}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
