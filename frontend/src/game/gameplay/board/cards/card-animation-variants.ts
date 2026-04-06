/**
 * Card Animation Variants
 *
 * Centralized animation configuration using Framer Motion variants.
 * Type-safe state machines for card animations.
 */

import { GAME_OVER_TIMING } from "../../game-over/game-over-timing";

/**
 * Scene-level states - for board orchestration
 */
export type SceneState = "hidden" | "visible" | "gameOverReveal";

/**
 * Board variants - orchestrates game-over card reveal staggering
 * Deal animation is handled separately by DealingBoard component
 */
export const boardVariants = {
  visible: {},
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
 * Removed: cardStateVariants no longer needed.
 * Card no longer uses 3D flip - CoverCard slides instead.
 * Word opacity is handled by FloatingWord component.
 */
