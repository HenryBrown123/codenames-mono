import React, { ReactNode } from "react";
import styles from "./sidebar-layout.module.css";

/**
 * Desktop sidebar container for dashboard and settings
 */

export interface DesktopSidebarProps {
  children: ReactNode;
  isFetching?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ children, isFetching = false }) => (
  <aside className={styles.sidebarContainer}>
    {isFetching && <div className={styles.refetchIndicator} />}
    <div className={styles.sidebarGrid}>{children}</div>
  </aside>
);
