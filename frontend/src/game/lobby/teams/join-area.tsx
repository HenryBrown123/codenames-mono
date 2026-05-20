import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeamConfig } from "@frontend/shared/types";
import { TerminalInput } from "@frontend/game/gameplay/shared/components";
import styles from "../layout/lobby.module.css";

/** Read-side state for {@link JoinAreaView}. */
export interface JoinAreaData {
  playerName: string;
  disabled: boolean;
}

/** Write-side handlers for {@link JoinAreaView}. */
export interface JoinAreaHandlers {
  onPlayerNameChange: (value: string) => void;
  onJoinRed: () => void;
  onJoinBlue: () => void;
}

/** Props for {@link JoinAreaView}. */
export type JoinAreaViewProps = JoinAreaData & JoinAreaHandlers;

/**
 * Multi-device join form — operative-name input plus two team
 * buttons. Both buttons stay disabled until the name field has
 * non-empty content.
 */
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
        <div className={styles.joinInputWrapper}>
          <TerminalInput
            id="join-name-input"
            placeholder="ENTER OPERATIVE NAME"
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            disabled={disabled}
            preserveCase
            autoFocus
          />
        </div>

        <div className={styles.teamButtonsGrid}>
          <motion.button
            id="join-team-red"
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
            id="join-team-blue"
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
