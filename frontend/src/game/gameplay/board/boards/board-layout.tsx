import React from "react";
import styles from "./board-layout.module.css";

interface GameBoardLayoutProps {
  children: React.ReactNode;
  className?: string;
  "data-ar-mode"?: boolean;
}

/**
 * Grid container that arranges card children into the 5×5 board
 * layout. `data-ar-mode` toggles the AR-overlay sizing variant on
 * both the wrapper and the grid.
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

/** Placeholder square that fills a card slot before deal completes. */
export const EmptyCard: React.FC = () => (
  <div className={styles.emptyCard} />
);