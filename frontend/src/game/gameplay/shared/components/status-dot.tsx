import React from "react";
import styles from "./status-dot.module.css";

interface StatusDotProps {
  active: boolean;
  /** When true, overrides the active state with a slow pulse. */
  thinking?: boolean;
}

/**
 * Glowing indicator dot — green when active, dim when not, with a
 * slow pulse override when `thinking`.
 */
export const StatusDot: React.FC<StatusDotProps> = ({ active, thinking = false }) => (
  <span className={styles.statusDot} data-active={active} data-thinking={thinking} />
);
