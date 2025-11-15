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
      x: "-50vw",
      y: "-80vh",
      rotate: -25,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 260,
        mass: 1.2,
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

// Removed: cardStateVariants no longer needed
// Card no longer uses 3D flip - CoverCard slides instead
// Word opacity is handled by FloatingWord component
