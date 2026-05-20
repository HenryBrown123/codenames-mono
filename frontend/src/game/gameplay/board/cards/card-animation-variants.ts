import { GAME_OVER_TIMING } from "../../game-over/game-over-timing";

/** Top-level orchestration state passed down to the board children. */
export type SceneState = "hidden" | "visible" | "gameOverReveal";

/**
 * Board-level variants for the end-of-round reveal — staggers each
 * card child so they flip over in a wave rather than simultaneously.
 * Deal-in animation is owned by `DealingBoard` and lives separately.
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

/** Visual-only presentation states for a single card. */
export type CardVisibilityState =
  | "normal"
  | "flipped"
  | "revealed"
  | "gameOver"
  | "gameOverSelected";
