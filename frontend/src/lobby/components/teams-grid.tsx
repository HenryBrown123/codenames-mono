import React from "react";
import styles from "../lobby.module.css";

/**
 * Grid layout for team tiles
 */

export interface TeamsGridViewProps {
  children: React.ReactNode;
}

export const TeamsGridView: React.FC<TeamsGridViewProps> = ({ children }) => (
  <div className={styles.teamsGrid}>{children}</div>
);

export interface TeamsGridMobileViewProps {
  children: React.ReactNode;
}

export const TeamsGridMobileView: React.FC<TeamsGridMobileViewProps> = ({ children }) => (
  <div className={styles.teamsGridMobile}>{children}</div>
);
