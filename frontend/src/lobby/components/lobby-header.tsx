import React from "react";
import styles from "../lobby.module.css";

/**
 * Lobby title bar showing game ID and player count
 */

export interface LobbyHeaderViewProps {
  title: string;
  gameId: string;
  playerCount: number;
}

export const LobbyHeaderView: React.FC<LobbyHeaderViewProps> = ({
  title,
  gameId,
  playerCount,
}) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.gameInfo}>
        ID: {gameId} | {playerCount} Players
      </div>
    </div>
  );
};
