/**
 * AR Overlay Components
 *
 * Visual enhancement components for AR Glasses mode in Spymaster view.
 * These components add sci-fi/tactical overlays to existing cards without
 * changing any game state management.
 */

import React from "react";
import styles from "./ar-overlay-components.module.css";

/**
 * AR scan grid overlay for cards
 */
export const ARScanGrid: React.FC<{ active?: boolean }> = ({ active = false }) => (
  <div className={styles.arScanGrid} data-active={active} />
);

/**
 * Main AR HUD overlay
 */
export const ARGlassesHUD: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.arGlassesHUD}>{children}</div>
);

/**
 * AR visor effect
 */
export const ARVisor: React.FC = () => (
  <div className={styles.arVisor}>
    <div className={styles.arGlare} />
    <div className={styles.arScanlines} />
  </div>
);

/**
 * AR glare effect
 */
export const ARGlare: React.FC = () => <div className={styles.arGlare} />;

/**
 * AR scanlines effect
 */
export const ARScanlines: React.FC = () => <div className={styles.arScanlines} />;

/**
 * AR HUD content container
 */
export const ARHUDContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.arHUDContent}>{children}</div>
);

/**
 * AR HUD top section
 */
export const ARHUDTop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      padding: "1rem",
      background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
    }}
  >
    {children}
  </div>
);

/**
 * AR HUD status display
 */
export const ARHUDStatus: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>{children}</div>
);

/**
 * AR HUD line item
 */
export const ARHUDLine: React.FC<{ children?: React.ReactNode; alert?: boolean }> = ({
  children,
  alert,
}) => (
  <div
    style={{
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: alert ? "#ffff00" : "#00ff88",
      opacity: 0.9,
    }}
  >
    &gt; {children}
  </div>
);

// Legacy exports for compatibility
export const SpymasterOverlayGrid = ARScanGrid;
export const SpymasterAROverlay = ARGlassesHUD;
