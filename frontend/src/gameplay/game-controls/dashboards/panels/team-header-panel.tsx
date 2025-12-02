import React from "react";
import { motion } from "framer-motion";
import { useGameDataRequired } from "../../../game-data/providers";
import { PlayerInfoLayout } from "../shared";
import styles from "./team-header-panel.module.css";

/**
 * Team Header Panel - Shows team symbol, role, and player name.
 * Extracted from team-symbol-header.tsx to be a self-contained panel.
 */
export const TeamHeaderPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();

  const teamName = gameData.playerContext?.teamName || "";
  const role = gameData.playerContext?.role || "SPECTATOR";
  const playerName = gameData.playerContext?.playerName;

  const teamLower = teamName.toLowerCase();
  const isRed = teamLower === "red" || teamName === "Team Red";
  const isBlue = teamLower === "blue" || teamName === "Team Blue";

  const symbol = isRed ? "◇" : isBlue ? "□" : "○";
  const color = isRed ? "#ff3333" : isBlue ? "#00ddff" : "#aaaaaa";

  return (
    <PlayerInfoLayout>
      {/* Team Symbol */}
      <motion.div
        className={styles.symbolContainer}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Shadow depression */}
        <div className={styles.symbolShadow}>{symbol}</div>
        {/* Crisp LED symbol */}
        <div
          className={styles.symbolLED}
          style={{
            color: color,
            textShadow: `0 0 8px ${color}`,
          }}
        >
          {symbol}
        </div>
        {/* Inner glow */}
        <div
          className={styles.symbolGlow}
          style={{
            textShadow: `0 0 4px ${color}`,
          }}
        >
          {symbol}
        </div>
      </motion.div>

      {/* Team Info */}
      <div className={styles.teamInfo}>
        <div className={styles.teamTitle}>
          <span className={styles.teamName}>{teamName.toUpperCase()}</span>
        </div>
        <div className={styles.teamRole}>{role}</div>
        <div className={styles.teamDivider} />
        {playerName && <div className={styles.playerName}>{playerName}</div>}
      </div>
    </PlayerInfoLayout>
  );
};
