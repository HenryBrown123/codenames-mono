import { GAME_OVER_TIMING as TIMING } from '../../../game-over/game-over-timing';
import type { Variants } from 'framer-motion';

/**
 * Container variant that coordinates timing for children based on card index
 * TeamColorFilter animates with delay based on card index
 * OverlayWord appears instantly (no delay)
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
