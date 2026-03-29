import React from "react";
import styles from "./page-container.module.css";

export { styles as pageContainerStyles };

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <div className={styles.container}>
    {children}
  </div>
);
