import React from "react";
import styles from "./board-layout.module.css";

interface GameBoardLayoutProps {
  children: React.ReactNode;
  className?: string;
  'data-ar-mode'?: boolean;
}

/**
 * Shared board layout component that provides consistent structure
 * for all role-specific boards
 */
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

/**
 * Empty card component for loading/skeleton states
 */
export const EmptyCard: React.FC = () => (
  <div className={styles.emptyCard} />
);