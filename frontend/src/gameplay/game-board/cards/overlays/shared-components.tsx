import { memo } from "react";
import { motion } from "framer-motion";
import { OverlayVariants } from "../card-types";
import styles from "../game-card.module.css";

const sharedOverlayVariants: OverlayVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
  normal: { opacity: 1 },
  flipped: { opacity: 1 },
  revealed: {
    opacity: 1,
    transition: { delay: 0.16, duration: 0.4 },
  },
  gameOver: {
    opacity: 1,
    transition: { delay: 0.16, duration: 0.4 },
  },
  gameOverSelected: {
    opacity: 1,
    transition: { delay: 0.16, duration: 0.4 },
  },
};

const contentFadeVariants: OverlayVariants = {
  hidden: {
    opacity: 0,
    scale: 1,
    transition: { duration: 0.2 },
  },
  normal: { opacity: 1, scale: 1 },
  flipped: { opacity: 1, scale: 1 },
  revealed: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  gameOver: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0,
    },
  },
  gameOverSelected: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0,
    },
  },
};

const cornersVariants: OverlayVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
  normal: { opacity: 0 },
  flipped: { opacity: 0 },
  revealed: {
    opacity: 1,
    transition: { delay: 0.24, duration: 0.4 },
  },
  gameOver: { opacity: 0 },
  gameOverSelected: { opacity: 0 },
};

const pulseVariants: OverlayVariants = {
  hidden: { opacity: 0 },
  normal: { opacity: 0 },
  flipped: { opacity: 0 },
  revealed: { opacity: 0 },
  gameOver: { opacity: 0 },
  gameOverSelected: {
    opacity: [0, 1, 0, 1, 0, 1, 1],
    scale: [1, 1.02, 1, 1.02, 1, 1.02, 1],
    transition: {
      duration: 1.8,
      times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
      ease: "easeInOut",
    },
  },
};

const teamColorFilterVariants: OverlayVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
  normal: { opacity: 1 },
  flipped: { opacity: 1 },
  revealed: {
    opacity: 1,
    transition: { delay: 0.16, duration: 0.4 },
  },
  gameOver: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
  gameOverSelected: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

export const TeamColorFilter = () => (
  <motion.div className={styles.teamColorFilter} variants={teamColorFilterVariants} />
);

export const OverlayWord = memo<{ word: string }>(({ word }) => (
  <motion.span className={styles.cardWord} variants={contentFadeVariants}>
    {word}
  </motion.span>
));
OverlayWord.displayName = "OverlayWord";

export const TeamBadge = memo<{ teamType: string }>(({ teamType }) => (
  <motion.div
    variants={sharedOverlayVariants}
    style={{
      position: "absolute",
      bottom: "8px",
      left: "50%",
      transform: "translateX(-50%)",
    }}
  >
    <div className={styles.teamBadge}>{teamType.toUpperCase()}</div>
  </motion.div>
));
TeamBadge.displayName = "TeamBadge";

export const TeamSymbol = memo(() => (
  <motion.div
    variants={sharedOverlayVariants}
    className={styles.spymasterSymbol}
    style={{
      position: "absolute",
      bottom: "8px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "1.5rem",
    }}
  />
));
TeamSymbol.displayName = "TeamSymbol";

export const ARCorners = memo(() => (
  <motion.div variants={cornersVariants} className={styles.cardARCorners}>
    <div className={styles.cardARCorner} data-position="tl" />
    <div className={styles.cardARCorner} data-position="tr" />
    <div className={styles.cardARCorner} data-position="bl" />
    <div className={styles.cardARCorner} data-position="br" />
  </motion.div>
));
ARCorners.displayName = "ARCorners";

export const OutlinePulse = memo(() => (
  <motion.div className={styles.outlinePulse} variants={pulseVariants} />
));
OutlinePulse.displayName = "OutlinePulse";
