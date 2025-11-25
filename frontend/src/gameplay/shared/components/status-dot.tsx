import React from "react";
import styles from "./status-dot.module.css";

interface StatusDotProps {
  active: boolean;
}

/**
 * Reusable status indicator dot
 * Shows green with glow when active, gray when inactive
 */
export const StatusDot: React.FC<StatusDotProps> = ({ active }) => (
  <span className={styles.statusDot} data-active={active} />
);
