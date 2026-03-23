import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import styles from "./team-header-panel.module.css";

/**
 * Ghost header — minimal identity row
 */

export interface TeamHeaderPanelViewProps {
  teamName: string;
  role: string;
  playerName?: string;
  variant?: "default" | "compact";
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
  variant = "default",
}) => {
  const { symbol, color, rotate } = getTeamStyle(teamName);
  const symbolStyle = rotate
    ? { display: "inline-block" as const, transform: "rotate(45deg)" }
    : undefined;

  if (variant === "compact") {
    return (
      <div className={styles.compactRow}>
        <span className={styles.compactName}>{playerName || "AGENT"}</span>
        <span className={styles.compactSymbol} style={{ color }} aria-hidden>
          <span style={symbolStyle}>{symbol}</span>
        </span>
        <span className={styles.compactRole}>{role}</span>
      </div>
    );
  }

  return (
    <div className={styles.ghostRow}>
      <span className={styles.playerName}>{playerName || "AGENT"}</span>
      <div className={styles.roleGroup}>
        <span className={styles.symbol} style={{ color }} aria-hidden>
          <span style={symbolStyle}>{symbol}</span>
        </span>
        <span className={styles.role}>{role}</span>
      </div>
    </div>
  );
};

interface TeamHeaderPanelProps {
  variant?: "default" | "compact";
}

export const TeamHeaderPanel: React.FC<TeamHeaderPanelProps> = ({ variant }) => {
  const { gameData } = useGameDataRequired();

  return (
    <TeamHeaderPanelView
      teamName={gameData.playerContext?.teamName || ""}
      role={gameData.playerContext?.role || "SPECTATOR"}
      playerName={gameData.playerContext?.playerName}
      variant={variant}
    />
  );
};
