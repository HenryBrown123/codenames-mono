/**
 * Game Over Animation Timing Constants
 * All durations in milliseconds for timeouts, seconds for Framer Motion delays
 */
export const GAME_OVER_TIMING = {
  FLASH_ENTER_DURATION: 0.3,
  FLASH_HOLD_DURATION: 1,
  FLASH_EXIT_DELAY: 1.0,
  FLASH_EXIT_DURATION: 0.5,

  FLASH_TOTAL: 2,

  CARD_STAGGER: 0.08,
  CARD_FADE_DURATION: 0.6,
  WORD_POP_DELAY: 0.1,

  DEBRIEF_DELAY: 0.1,
  DEBRIEF_FADE_DURATION: 1.0,
  DEBRIEF_STAT_STAGGER: 0.3,
} as const;
