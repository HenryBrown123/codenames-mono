import React from "react";
import styles from "./loading-spinner.module.css";

export const LoadingSpinner = ({ displayText = "Loading..." }) => {
  return (
    <div className={styles.loadingContainer}>
      <p>{displayText}</p>
      <div className={styles.spinner} />
    </div>
  );
};
