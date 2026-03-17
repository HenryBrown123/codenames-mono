import React from "react";
import { PlayerTileBase } from "./player-tile-base";
import styles from "../lobby.module.css";

export interface ReadOnlyPlayerTileProps {
  playerName: string;
  isCurrentUser?: boolean;
}

export const ReadOnlyPlayerTile: React.FC<ReadOnlyPlayerTileProps> = ({
  playerName,
  isCurrentUser,
}) => (
  <PlayerTileBase
    playerName={playerName}
    badge={isCurrentUser ? <span className={styles.youBadge}>(You)</span> : undefined}
  />
);
