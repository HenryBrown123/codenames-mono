import React from "react";
import styles from "../lobby.module.css";

/**
 * Visual base for all player tiles.
 * Knows how to render a name in a tile. Nothing else.
 */

export interface PlayerTileBaseProps {
  playerName: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PlayerTileBase: React.FC<PlayerTileBaseProps> = ({
  playerName,
  badge,
  actions,
}) => (
  <div className={styles.playerTile}>
    <span className={styles.playerName}>{playerName}</span>
    {badge}
    {actions}
  </div>
);
