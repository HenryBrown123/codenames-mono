import React from "react";
import { motion } from "framer-motion";
import styles from "./terminal-components.module.css";

/** Minimum drag distance (px) before a swipe counts as a page change. */
export const SWIPE_THRESHOLD = 50;
/** Minimum drag velocity (px/s) that triggers a snap even below the distance threshold. */
export const VELOCITY_THRESHOLD = 500;

/**
 * Slide-in/out variants for any AnimatePresence carousel — `dir` is
 * the swipe direction (-1 = back, +1 = forward).
 */
export const carouselVariants = {
  enter: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? -100 : 100, opacity: 0 }),
};

/** Shared transition timing for the carousel slide animation. */
export const CAROUSEL_TRANSITION = { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const };

/**
 * Card container that wraps each terminal-style panel.
 *
 * Pops in with a spring on mount; opts into framer layout
 * animations by default so neighbouring panels morph rather than
 * jump when this one mounts or unmounts. Pass `layoutId` to share
 * the animation across siblings.
 */
export const TerminalSection: React.FC<{
  children?: React.ReactNode;
  layoutId?: string;
  disableLayoutAnimation?: boolean;
  borderless?: boolean;
}> = ({ children, layoutId, disableLayoutAnimation = false, borderless = false }) => (
  <motion.div
    className={styles.terminalSection}
    data-borderless={borderless}
    layoutId={layoutId}
    layout={!disableLayoutAnimation}
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    }}
    transition={{
      layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.2 },
    }}
  >
    {children}
  </motion.div>
);

/** Small caps "command name" label shown above terminal-section content. */
export const TerminalCommand: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.terminalCommand}>{children}</div>
);

/** Flex row layout for player/team header content. */
export const PlayerInfoLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.playerInfoLayout}>{children}</div>
);

/** Re-export from shared components for backward compatibility */
export { AttentionTextBox } from "@frontend/game/gameplay/shared/components";

/** Flex wrapper that fills the dashboard's middle grid section. */
export const MiddleSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.middleSection}>{children}</div>
);

/** Min-height container that hosts the AR-toggle row. */
export const SpyGogglesContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.spyGogglesContainer}>{children}</div>
);

/** Flex row inside {@link SpyGogglesContainer} pairing the dot and the toggle. */
export const SpyGogglesSwitchRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.spyGogglesSwitchRow}>{children}</div>
);

interface SpyGogglesDotProps {
  active: boolean;
}

/** Status dot shown next to the AR toggle. */
export const SpyGogglesDot: React.FC<SpyGogglesDotProps> = ({ active }) => (
  <span className={styles.spyGogglesDot} data-active={active} />
);
