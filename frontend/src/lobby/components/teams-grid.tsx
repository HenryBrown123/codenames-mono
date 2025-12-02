import React from "react";
import styles from "../lobby.module.css";

/**
 * Grid layout for team tiles - desktop shows both, mobile shows one at a time
 */

export interface TeamsGridViewProps {
  children: React.ReactNode;
}

export const TeamsGridView: React.FC<TeamsGridViewProps> = ({ children }) => {
  return <div className={styles.teamsGrid}>{children}</div>;
};

// Mobile version that shows one team at a time
export interface TeamsGridMobileViewProps {
  children: React.ReactNode;
}

export const TeamsGridMobileView: React.FC<TeamsGridMobileViewProps> = ({ children }) => {
  return <div className={styles.teamsGridMobile}>{children}</div>;
};
