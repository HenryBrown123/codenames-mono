import React, { ReactNode } from "react";
import styles from "./page-layout.module.css";

/**
 * Main page layout wrapper with header and content area
 */

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>{children}</div>
  </div>
);

export default PageLayout;
