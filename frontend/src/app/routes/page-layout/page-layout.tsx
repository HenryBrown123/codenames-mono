import React, { ReactNode } from "react";
import styles from "./page-layout.module.css";

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * Outer page chrome. Wraps the route's content in the app's standard
 * frame; routes mount their content as `children`.
 */
const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>{children}</div>
  </div>
);

export default PageLayout;
