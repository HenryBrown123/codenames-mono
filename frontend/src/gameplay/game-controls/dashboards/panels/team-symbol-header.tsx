import React from "react";
import { motion } from "framer-motion";
import { PlayerInfoLayout } from "../shared";
import styles from "./team-header-panel.module.css";

/**
 * Animated team symbol with color theming
 */

interface TeamSymbolHeaderProps {
  teamName: string;
  role: "CODEMASTER" | "CODEBREAKER" | "SPECTATOR";
  playerName?: string;
  symbol: string;
  color: string;
}

export const TeamSymbolHeader: React.FC<TeamSymbolHeaderProps> = ({
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
