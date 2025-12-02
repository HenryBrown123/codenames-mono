import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../lobby.module.css";

/**
 * Form for new players to enter their name and choose a team to join (multi-device mode)
 */

const TEAM_COLORS = {
  "Team Red": "var(--color-team-red, #ff0040)",
  "Team Blue": "var(--color-team-blue, #00d4ff)",
};

export interface JoinAreaViewProps {
  playerName: string;
  onPlayerNameChange: (value: string) => void;
  onJoinRed: () => void;
  onJoinBlue: () => void;
  disabled?: boolean;
}

export const JoinAreaView: React.FC<JoinAreaViewProps> = ({
  playerName,
  onPlayerNameChange,
  onJoinRed,
  onJoinBlue,
  disabled = false,
}) => {
  const canJoin = playerName.trim().length > 0 && !disabled;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="join-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
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
            style={{ "--team-color": TEAM_COLORS["Team Red"] } as React.CSSProperties}
            onClick={onJoinRed}
            disabled={!canJoin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            JOIN TEAM RED
          </motion.button>
          <motion.button
            className={styles.joinTeamButton}
            style={{ "--team-color": TEAM_COLORS["Team Blue"] } as React.CSSProperties}
            onClick={onJoinBlue}
            disabled={!canJoin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            JOIN TEAM BLUE
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
