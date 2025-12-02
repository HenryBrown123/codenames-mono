import React from "react";
import styles from "../lobby.module.css";

/**
 * Team card displaying player list with optional drag-drop support and footer slot
 */

export interface TeamTileViewProps {
  teamName: string;
  teamColor: string;
  playerCount: number;
  maxPlayers?: number;
  children: React.ReactNode; // Player list
  footer?: React.ReactNode; // Add player input (single-device)
  emptyMessage?: string;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const TeamTileView: React.FC<TeamTileViewProps> = ({
  teamName,
  teamColor,
  playerCount,
  maxPlayers = 6,
  children,
  footer,
  emptyMessage,
  isDragOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const displayName = teamName === "Team Red" ? "RED OPERATIVES" : "BLUE OPERATIVES";

  return (
    <div
      className={styles.teamTile}
      style={{ "--team-color": teamColor } as React.CSSProperties}
      data-drag-over={isDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={styles.teamHeader}>
        <h2
          className={styles.teamName}
          style={{ "--team-color": teamColor } as React.CSSProperties}
        >
          {displayName}
          <span className={styles.playerCount}>
            {playerCount}/{maxPlayers}
          </span>
        </h2>
      </div>

      <div className={styles.playersContainer}>
        {children}
        {playerCount === 0 && emptyMessage && (
          <div className={styles.emptyTeamMessage}>{emptyMessage}</div>
        )}
      </div>

      {footer}
    </div>
  );
};
