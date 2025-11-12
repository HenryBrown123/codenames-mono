/**
 * Card Animation Variants
 *
 * Centralized animation configuration using Framer Motion variants.
 * Type-safe state machines for card animations.
 */

/**
 * Scene-level states - for board orchestration (dealing, game over reveal)
 */
import { GAME_OVER_TIMING } from "../../game-over/game-over-timing";

export type SceneState = "hidden" | "visible" | "gameOverReveal";

/**
 * Scene variants for cards - how cards respond to board state
 */
export const sceneVariants = {
  card: {
    hidden: {
      opacity: 0,
      y: -200,
      rotate: -45,
      scale: 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
      },
    },
  },
};

/**
 * Board variants - orchestrates card staggering
 */
export const boardVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  gameOverReveal: {
    transition: {
      staggerChildren: GAME_OVER_TIMING.CARD_STAGGER,
      delayChildren: GAME_OVER_TIMING.CARD_REVEAL_START_DELAY,
    },
  },
};

/**
 * Card visibility states - visual presentation layer
 * Independent of React component state
 */
export type CardVisibilityState =
  | "normal"
  | "flipped"
  | "revealed"
  | "gameOver"
  | "gameOverSelected";

/**
 * Card state variants - controls flip and reveal animations
 */
export const cardStateVariants = {
  container: {
    normal: {
      rotateY: 0,
    },
    flipped: {
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
    revealed: {
      rotateY: 0,
    },
    gameOver: {
      rotateY: 0,
    },
    gameOverSelected: {
      rotateY: 180,
    },
  },

  frontFace: {
    normal: { opacity: 1 },
    flipped: { opacity: 1 },
    revealed: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
    gameOver: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
    gameOverSelected: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  },
};
