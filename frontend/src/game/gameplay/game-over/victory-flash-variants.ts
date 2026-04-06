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
