import React from "react";
import styles from "../layout/lobby.module.css";

/** Props for {@link LobbyHeaderView}. */
export interface LobbyHeaderViewProps {
  title: string;
  gameId: string;
  playerCount: number;
}

/** Lobby title bar — title plus a "ID: x | N Players" meta line. */
export const LobbyHeaderView: React.FC<LobbyHeaderViewProps> = ({
  title,
  gameId,
  playerCount,
}) => (
  <div className={styles.header}>
    <h1 className={styles.title}>{title}</h1>
    <div className={styles.gameInfo}>
      ID: {gameId} | {playerCount} Players
    </div>
  </div>
);
