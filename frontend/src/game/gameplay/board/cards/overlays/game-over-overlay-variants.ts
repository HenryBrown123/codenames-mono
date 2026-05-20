import { GAME_OVER_TIMING as TIMING } from '../../../game-over/game-over-timing';
import type { Variants } from 'framer-motion';

/**
 * Variants for the per-card game-over overlay container.
 *
 * `gameOver` is a dynamic variant — call with `cardIndex` to stagger
 * each card's reveal by `CARD_STAGGER * index` so the board flips
 * over in a wave. The colour filter inherits the delay; the word
 * label inside appears immediately.
 */
export const gameOverContainerVariants = {
  hidden: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
  gameOver: (cardIndex: number) => ({
    transition: {
      delayChildren: TIMING.CARD_REVEAL_START_DELAY + cardIndex * TIMING.CARD_STAGGER,
      staggerChildren: 0,
    },
  }),
} satisfies Variants;
