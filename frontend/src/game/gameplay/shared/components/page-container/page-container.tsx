import React from "react";
import styles from "./page-container.module.css";

/** Raw CSS-module styles for the page-container — exposed for layouts that compose it inline. */
export { styles as pageContainerStyles };

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * Centred page-shell card used by pre-game scenes. Pure wrapper; no
 * scrolling, no padding logic — content owns its own spacing.
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <div className={styles.container}>
    {children}
  </div>
);
