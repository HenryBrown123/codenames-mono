import React, { ReactNode } from "react";
import styles from "./sidebar-layout.module.css";

export interface DesktopSidebarProps {
  children: ReactNode;
  isFetching?: boolean;
}

/**
 * Desktop sidebar component that provides consistent layout for dashboard content.
 * Uses CSS Grid with three rows: auto (top), 1fr (middle), auto (bottom).
 * This ensures top and bottom sections are always visible while middle section
 * expands to fill available space.
 */
export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ children, isFetching = false }) => {
  return (
    <aside className={styles.sidebarContainer}>
      {isFetching && <div className={styles.refetchIndicator} />}
      <div className={styles.sidebarGrid}>{children}</div>
    </aside>
  );
};
