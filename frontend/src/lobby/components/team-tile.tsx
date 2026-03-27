import React from "react";
import { getTeamConfig } from "@frontend/shared-types";
import { TeamSymbolIcon } from "../../shared/team-symbol-icon";
import styles from "../lobby.module.css";

/**
 * Team card displaying player list with optional drag-drop support and footer slot
 */

/** Display state for the team tile */
export interface TeamTileData {
  teamName: string;
  playerCount: number;
  maxPlayers?: number;
  emptyMessage?: string;
  isDragOver?: boolean;
}

/** Drag-drop handlers for team tile (single-device mode only) */
export interface TeamTileHandlers {
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

/** Composition slots for team tile content */
export interface TeamTileSlots {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Full props for the team tile */
export type TeamTileViewProps = TeamTileData & TeamTileHandlers & TeamTileSlots;

export const TeamTileView: React.FC<TeamTileViewProps> = ({
  teamName,
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
  const config = getTeamConfig(teamName);
  const teamColor = config.cssVar;

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
          style={{ "--team-color": teamColor, "--symbol-color": teamColor } as React.CSSProperties}
        >
          <TeamSymbolIcon symbol={config.symbol} rotate={config.symbolRotate} />
          {config.shortName}
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
