import { GAME_OVER_TIMING as TIMING } from "./game-over-timing";
import type { Variants } from "framer-motion";

export const victoryFlashVariants = {
  hidden: {
    opacity: 0,
    scale: 1.1,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.FLASH_ENTER_DURATION,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMING.FLASH_EXIT_DURATION,
      ease: "easeIn",
      delay: TIMING.FLASH_EXIT_DELAY,
    },
  },
} satisfies Variants;

export const cardOverlayRevealVariants = {
  idle: {
    opacity: 0,
  },
  revealed: (cardIndex: number) => ({
    opacity: 0.9,
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
