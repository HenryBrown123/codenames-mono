import React from "react";
import styles from "./error-box.module.css";

interface ErrorBoxProps {
  message: string;
}

export const ErrorBox: React.FC<ErrorBoxProps> = ({ message }) => (
  <div className={styles.errorBox}>
    <span className={styles.prompt}>ERROR:</span>
    <span className={styles.text}>{message}</span>
  </div>
);
