import React from "react";
import { motion } from "framer-motion";
import { useGameDataRequired } from "../../../game-data/providers";
import { PlayerInfoLayout } from "../shared";
import styles from "./team-header-panel.module.css";

// ============================================================================
// PRESENTATIONAL COMPONENT
// ============================================================================

export interface TeamHeaderPanelViewProps {
  teamName: string;
  role: string;
  playerName?: string;
}

export const TeamHeaderPanelView: React.FC<TeamHeaderPanelViewProps> = ({
  teamName,
  role,
  playerName,
}) => {
  const teamLower = teamName.toLowerCase();
  const isRed = teamLower === "red" || teamName === "Team Red";
  const isBlue = teamLower === "blue" || teamName === "Team Blue";

  const symbol = isRed ? "◇" : isBlue ? "□" : "○";
  const color = isRed ? "#ff3333" : isBlue ? "#00ddff" : "#aaaaaa";

  return (
    <PlayerInfoLayout>
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
        <div className={styles.symbolShadow}>{symbol}</div>
        <div
          className={styles.symbolLED}
          style={{
            color: color,
            textShadow: `0 0 8px ${color}`,
          }}
        >
          {symbol}
        </div>
        <div
          className={styles.symbolGlow}
          style={{
            textShadow: `0 0 4px ${color}`,
          }}
        >
          {symbol}
        </div>
      </motion.div>

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

// ============================================================================
// CONNECTED COMPONENT
// ============================================================================

export const TeamHeaderPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();

  return (
    <TeamHeaderPanelView
      teamName={gameData.playerContext?.teamName || ""}
      role={gameData.playerContext?.role || "SPECTATOR"}
      playerName={gameData.playerContext?.playerName}
    />
  );
};
