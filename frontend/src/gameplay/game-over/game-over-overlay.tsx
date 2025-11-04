import React from "react";
import { motion } from "framer-motion";
import { useGameDataRequired } from "../game-data/providers";
import { useGameActions } from "../game-actions";
import { ActionButton } from "../shared/components";
import styles from "./game-over-overlay.module.css";

/**
 * Game Over Overlay - Full screen takeover with mission debrief
 */
export const GameOverOverlay: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { createRound } = useGameActions();

  const winningTeam = gameData.teams?.find((team) => team.score >= 9);
  const losingTeam = gameData.teams?.find((team) => team.score < 9);
  
  const totalTurns = gameData.currentRound?.turns?.length || 0;
  const totalCards = gameData.currentRound?.cards?.filter(c => c.selected).length || 0;

  const teamColor = winningTeam?.name.includes("Red") 
    ? "var(--color-team-red)" 
    : "var(--color-team-blue)";

  return (
    <motion.div
      className={styles.overlay}
      style={{ "--winning-color": teamColor } as React.CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glitch effect background */}
      <motion.div
        className={styles.glitchLayer}
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 0.8, 1, 0.9, 1, 0] }}
        transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      />

      {/* Color takeover */}
      <motion.div
        className={styles.colorTakeover}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Mission debrief content */}
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.missionComplete}>
          <motion.div
            className={styles.statusLine}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            &gt; MISSION STATUS: <span className={styles.complete}>COMPLETE</span>
          </motion.div>

          <motion.h1
            className={styles.winner}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            {winningTeam?.name.toUpperCase()} VICTORIOUS
          </motion.h1>
        </div>

        <motion.div
          className={styles.debrief}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <div className={styles.debriefHeader}>MISSION DEBRIEF</div>
          
          <div className={styles.stats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>WINNING TEAM:</span>
              <span className={styles.statValue}>{winningTeam?.name}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>FINAL SCORE:</span>
              <span className={styles.statValue}>
                {winningTeam?.score} - {losingTeam?.score}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>TOTAL TURNS:</span>
              <span className={styles.statValue}>{totalTurns}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>CARDS REVEALED:</span>
              <span className={styles.statValue}>{totalCards} / 25</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
        >
          <ActionButton
            onClick={() => createRound()}
            text="NEW MISSION"
            enabled={true}
          />
        </motion.div>
      </motion.div>

      {/* Scanlines effect */}
      <div className={styles.scanlines} />
    </motion.div>
  );
};
