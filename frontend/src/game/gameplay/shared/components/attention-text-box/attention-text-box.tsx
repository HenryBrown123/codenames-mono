import React from "react";
import styles from "./attention-text-box.module.css";

/**
 * Bordered, glowing call-out used for short status phrases
 * (`AWAITING INPUT`, `TURN COMPLETE`, etc.).
 */
export const AttentionTextBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.attentionTextBox}>{children}</div>
);
