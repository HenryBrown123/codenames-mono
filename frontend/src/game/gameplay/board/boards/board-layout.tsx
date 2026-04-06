import React from "react";
import styles from "./board-layout.module.css";

/**
 * Grid layout container for game cards
 */

interface GameBoardLayoutProps {
  children: React.ReactNode;
  className?: string;
  "data-ar-mode"?: boolean;
}

export const GameBoardLayout: React.FC<GameBoardLayoutProps> = ({
  children,
  className,
  "data-ar-mode": dataArMode,
}) => (
  <div
    className={`${styles.boardWrapper} ${className || ''}`}
    data-ar-mode={dataArMode}
  >
    <div className={styles.boardGrid} aria-label="game board" data-ar-mode={dataArMode}>
      {children}
    </div>
  </div>
);

export const EmptyCard: React.FC = () => (
  <div className={styles.emptyCard} />
);