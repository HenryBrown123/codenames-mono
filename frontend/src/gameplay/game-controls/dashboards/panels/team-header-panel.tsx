import React from "react";
import { motion } from "framer-motion";
import { useGameDataRequired } from "../../../game-data/providers";
import { TerminalSection, TerminalDivider } from "../shared";
import styles from "./team-header-panel.module.css";

/**
 * Team header with symbol and turn indicator
 */

export interface TeamHeaderPanelViewProps {
  teamName: string;
  role: string;
  playerName?: string;
}

/**
 * Get team symbol styling based on team name.
 */
const getTeamStyle = (teamName: string): { symbol: string; color: string; rotate: boolean } => {
  const teamLower = teamName.toLowerCase();
  const isRed = teamLower === "red" || teamLower.includes("red");
  const isBlue = teamLower === "blue" || teamLower.includes("blue");
  if (isRed) return { symbol: "□", color: "#ff3333", rotate: true };
  if (isBlue) return { symbol: "□", color: "#00ddff", rotate: false };
  return { symbol: "○", color: "#aaaaaa", rotate: false };
};

export const TeamHeaderPanelView: React.FC<TeamHeaderPanelViewProps> = ({
  teamName,
  role,
  playerName,
}) => {
  // Derive symbol styling from teamName
  const { symbol, color, rotate } = getTeamStyle(teamName);
  const symbolStyle = rotate
    ? { display: "inline-block" as const, transform: "rotate(45deg)" }
    : undefined;

  return (
    <TerminalSection borderless>
      <div className={styles.headerRow}>
        <motion.div
          className={styles.symbolContainer}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={styles.symbolShadow}>
            <span style={symbolStyle}>{symbol}</span>
          </div>
          <div
            className={styles.symbolLED}
            style={{ color: color, textShadow: `0 0 8px ${color}` }}
          >
            <span style={symbolStyle}>{symbol}</span>
          </div>
          <div className={styles.symbolGlow} style={{ textShadow: `0 0 4px ${color}` }}>
            <span style={symbolStyle}>{symbol}</span>
          </div>
        </motion.div>

        <div className={styles.teamInfo}>
          <div className={styles.teamTitle}>
            <span className={styles.teamName}>{playerName || "AGENT"}</span>
          </div>
          <div className={styles.teamRole}>{role}</div>
        </div>
      </div>
      <TerminalDivider />
    </TerminalSection>
  );
};

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
