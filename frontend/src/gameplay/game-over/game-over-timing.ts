/**
 * Game Over Animation Timing Constants
 * All durations in milliseconds for timeouts, seconds for Framer Motion delays
 *
 * Timeline:
 * 0.0s - Victory flash enters
 * 0.3s - Flash fully visible
 * 2.0s - Flash exit begins (state change)
 * 3.0s - Flash starts fading (after 1s delay)
 * 3.5s - Flash completely gone
 * 3.5s - Cards begin revealing (staggered)
 * 3.5s - Dashboard fades in
 */
export const GAME_OVER_TIMING = {
  FLASH_ENTER_DURATION: 0.3,
  FLASH_HOLD_DURATION: 1,
  FLASH_EXIT_DELAY: 1.0,
  FLASH_EXIT_DURATION: 0.5,

  FLASH_TOTAL: 2,
  FLASH_COMPLETE: 3.5,

  CARD_REVEAL_START_DELAY: 3.5,
  CARD_STAGGER: 0.08,
  CARD_FADE_DURATION: 0.6,
  WORD_POP_DELAY: 0.1,

  DEBRIEF_DELAY: 3.5,
  DEBRIEF_FADE_DURATION: 1.0,
  DEBRIEF_STAT_STAGGER: 0.3,
} as const;
