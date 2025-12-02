import React from "react";
import { motion } from "framer-motion";
import { useGameDataRequired } from "../../../game-data/providers";
import { PlayerInfoLayout } from "../shared";
import styles from "./team-header-panel.module.css";

/**
 * Team header with symbol and turn indicator
 */

export interface TeamHeaderPanelViewProps {
  teamName: string;
  role: string;
  playerName?: string;
  symbol: string;
  color: string;
}

export const TeamHeaderPanelView: React.FC<TeamHeaderPanelViewProps> = ({
  teamName,
  role,
  playerName,
  symbol,
  color,
}) => (
  <PlayerInfoLayout>
    <motion.div
      className={styles.symbolContainer}
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className={styles.symbolShadow}>{symbol}</div>
      <div
        className={styles.symbolLED}
        style={{ color: color, textShadow: `0 0 8px ${color}` }}
      >
        {symbol}
      </div>
      <div className={styles.symbolGlow} style={{ textShadow: `0 0 4px ${color}` }}>
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

export const TeamHeaderPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();

  const teamName = gameData.playerContext?.teamName || "";
  const teamLower = teamName.toLowerCase();
  const isRed = teamLower === "red" || teamName === "Team Red";
  const isBlue = teamLower === "blue" || teamName === "Team Blue";

  const symbol = isRed ? "◇" : isBlue ? "□" : "○";
  const color = isRed ? "#ff3333" : isBlue ? "#00ddff" : "#aaaaaa";

  return (
    <TeamHeaderPanelView
      teamName={teamName}
      role={gameData.playerContext?.role || "SPECTATOR"}
      playerName={gameData.playerContext?.playerName}
      symbol={symbol}
      color={color}
    />
  );
};
