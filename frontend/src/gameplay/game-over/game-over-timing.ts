/**
 * Game Over Animation Timing Constants
 * All durations in milliseconds for timeouts, seconds for Framer Motion delays
 *
 * Timeline:
 * 0.0s - Victory flash enters
 * 0.3s - Flash fully visible
 * 1.0s - Flash exit begins (state change)
 * 1.5s - Flash starts fading (after 0.5s delay)
 * 1.8s - Flash completely gone
 * 1.8s - Cards begin revealing (staggered)
 * 1.8s - Dashboard fades in
 */
export const GAME_OVER_TIMING = {
  FLASH_ENTER_DURATION: 0.3,
  FLASH_HOLD_DURATION: 0.4,
  FLASH_EXIT_DELAY: 0.5,
  FLASH_EXIT_DURATION: 0.3,

  FLASH_TOTAL: 1.0,
  FLASH_COMPLETE: 1.8,

  CARD_REVEAL_START_DELAY: 1.8,
  CARD_STAGGER: 0.08,
  CARD_FADE_DURATION: 0.6,
  WORD_POP_DELAY: 0.1,

  DEBRIEF_DELAY: 1.8,
  DEBRIEF_FADE_DURATION: 1.0,
  DEBRIEF_STAT_STAGGER: 0.3,
} as const;
