import React from "react";
import styles from "../layout/lobby.module.css";

/** Props for {@link TeamsGridView}. */
export interface TeamsGridViewProps {
  children: React.ReactNode;
}

/** Desktop side-by-side grid wrapper for team tiles. */
export const TeamsGridView: React.FC<TeamsGridViewProps> = ({ children }) => (
  <div className={styles.teamsGrid}>{children}</div>
);

/** Props for {@link TeamsGridMobileView}. */
export interface TeamsGridMobileViewProps {
  children: React.ReactNode;
}

/** Mobile single-team grid wrapper — hidden on desktop via CSS. */
export const TeamsGridMobileView: React.FC<TeamsGridMobileViewProps> = ({ children }) => (
  <div className={styles.teamsGridMobile}>{children}</div>
);
