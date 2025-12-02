import React from "react";
import styles from "./error-message.module.css";

/**
 * Error message display component
 */

export const ErrorMessage = ({ messageText = "Sorry, something went wrong :(" }) => (
  <div className={styles.errorMessageContainer}>
    <div className={styles.errorMessageText}>
      <p>{messageText}</p>
    </div>
  </div>
);
