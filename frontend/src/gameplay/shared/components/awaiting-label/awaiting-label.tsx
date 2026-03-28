import React from "react";
import styles from "./awaiting-label.module.css";

export const AwaitingLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.awaitingLabel}>{children}</div>
);
