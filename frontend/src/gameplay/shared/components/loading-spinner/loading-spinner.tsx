import React from "react";
import styles from "./loading-spinner.module.css";

/**
 * Animated loading spinner with text
 */

export const LoadingSpinner = ({ displayText = "Loading..." }) => (
  <div className={styles.loadingContainer}>
    <p>{displayText}</p>
    <div className={styles.spinner} />
  </div>
);
