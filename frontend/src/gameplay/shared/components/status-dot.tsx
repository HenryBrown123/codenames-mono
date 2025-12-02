import React from "react";
import styles from "./status-dot.module.css";

/**
 * Glowing status indicator dot
 */

interface StatusDotProps {
  active: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ active }) => (
  <span className={styles.statusDot} data-active={active} />
);
