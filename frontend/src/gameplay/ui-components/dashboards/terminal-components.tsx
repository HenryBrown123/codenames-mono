import React from "react";
import styles from "./terminal-components.module.css";

/**
 * Simple wrapper for mobile view compatibility
 */
export const TerminalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalContent}>{children}</div>
);

/**
 * Terminal section card - provides visual container for content
 */
export const TerminalSection: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalSection}>{children}</div>
);

export const TerminalPrompt: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalPrompt}>{children}</div>
);

export const TerminalOutput: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalOutput}>{children}</div>
);

export const TerminalMessageBlock: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <pre className={styles.terminalMessageBlock}>{children}</pre>
);

export const TerminalCommand: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalCommand}>{children}</div>
);

interface TerminalStatusProps {
  children: React.ReactNode;
  type?: "success" | "warning" | "error";
}

export const TerminalStatus: React.FC<TerminalStatusProps> = ({ children, type }) => (
  <div className={styles.terminalStatus} data-type={type}>{children}</div>
);

export const TerminalDivider: React.FC = () => (
  <div className={styles.terminalDivider} />
);

export const TerminalActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalActions}>{children}</div>
);

export const TerminalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalHeader}>{children}</div>
);

export const CompactTerminalActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.compactTerminalActions}>{children}</div>
);

interface ARStatusBarProps {
  children: React.ReactNode;
  active: boolean;
}

export const ARStatusBar: React.FC<ARStatusBarProps> = ({ children, active }) => (
  <div className={styles.arStatusBar} data-active={active}>{children}</div>
);

export const TerminalCursor: React.FC = () => (
  <span className={styles.terminalCursor} />
);

export const TerminalToggleRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalToggleRow}>{children}</div>
);

/**
 * Wrapper for middle grid section - ensures it fills available space
 */
export const MiddleSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.middleSection}>{children}</div>
);

/**
 * Spy goggles container with minimum height for better spacing
 */
export const SpyGogglesContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.spyGogglesContainer}>{children}</div>
);

export const SpyGogglesText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className={styles.spyGogglesText}>{children}</p>
);

export const SpyGogglesSwitchRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.spyGogglesSwitchRow}>{children}</div>
);

interface SpyGogglesDotProps {
  active: boolean;
}

export const SpyGogglesDot: React.FC<SpyGogglesDotProps> = ({ active }) => (
  <span className={styles.spyGogglesDot} data-active={active} />
);

interface SpySwitchProps {
  children: React.ReactNode;
}

export const SpySwitch: React.FC<SpySwitchProps> = ({ children }) => (
  <label className={styles.spySwitch}>{children}</label>
);

export const SpySlider: React.FC = () => (
  <span className={styles.spySlider} />
);

interface SpyStatusProps {
  children: React.ReactNode;
  active: boolean;
}

export const SpyStatus: React.FC<SpyStatusProps> = ({ children, active }) => (
  <span className={styles.spyStatus} data-active={active}>{children}</span>
);