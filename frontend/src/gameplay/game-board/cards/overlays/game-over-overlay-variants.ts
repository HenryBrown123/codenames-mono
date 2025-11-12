import { GAME_OVER_TIMING as TIMING } from '../../../game-over/game-over-timing';
import type { Variants } from 'framer-motion';

export const cardOverlayRevealVariants = {
  idle: {
    opacity: 0,
  },
  revealed: (cardIndex: number) => ({
    opacity: 1,
    transition: {
      duration: TIMING.CARD_FADE_DURATION,
      delay: TIMING.CARD_REVEAL_START_DELAY + cardIndex * TIMING.CARD_STAGGER,
    },
  }),
} satisfies Variants;

export const wordPopVariants = {
  idle: {
    opacity: 0,
  },
  revealed: (cardIndex: number) => ({
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      delay:
        TIMING.CARD_REVEAL_START_DELAY + cardIndex * TIMING.CARD_STAGGER + TIMING.WORD_POP_DELAY,
    },
  }),
} satisfies Variants;
