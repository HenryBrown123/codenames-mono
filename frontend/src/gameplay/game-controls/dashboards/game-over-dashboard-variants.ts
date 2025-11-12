import { GAME_OVER_TIMING as TIMING } from '../../game-over/game-over-timing';
import type { Variants } from 'framer-motion';

export const debriefOverlayVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.DEBRIEF_FADE_DURATION,
      ease: "easeOut",
      delay: TIMING.DEBRIEF_DELAY,
      staggerChildren: TIMING.DEBRIEF_STAT_STAGGER,
      delayChildren: TIMING.DEBRIEF_DELAY + 0.5,
    },
  },
} satisfies Variants;

export const debriefStatVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
} satisfies Variants;
