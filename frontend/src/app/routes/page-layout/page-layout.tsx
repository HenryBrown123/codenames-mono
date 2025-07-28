import React, { ReactNode } from "react";
import styles from "./page-layout.module.css";

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * Page layout component with mobile-first viewport handling
 */
const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>{children}</div>
  </div>
);

export default PageLayout;
