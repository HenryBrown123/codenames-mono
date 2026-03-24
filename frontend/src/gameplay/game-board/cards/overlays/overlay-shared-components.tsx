import React from "react";
import styles from "./overlay-shared-components.module.css";

/**
 * AR scan grid overlay for individual cards.
 * Renders a crosshatch grid pattern on spymaster cards when active.
 */
export const ARScanGrid: React.FC<{ active?: boolean }> = ({ active = false }) => (
  <div className={styles.arScanGrid} data-active={active} />
);
