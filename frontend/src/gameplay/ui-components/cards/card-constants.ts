export const CARD_ANIMATION = {
  DEAL_DURATION: 700,
  DEAL_STAGGER: 75,
  REVEAL_DURATION: 600,
  HOVER_DURATION: 200,
  COVER_DURATION: 500,
} as const;

export const CARD_DIMENSIONS = {
  MOBILE_MIN_HEIGHT: 60,
  TABLET_MIN_HEIGHT: 70,
  DESKTOP_MIN_HEIGHT: 80,
  ASPECT_RATIO: '2.4 / 3',
  BORDER_RADIUS: {
    MOBILE: 6,
    TABLET: 8,
    DESKTOP: 12,
  },
} as const;

export const CARD_TYPOGRAPHY = {
  LETTER_SPACING: {
    MOBILE: '0.05em',
    TABLET: '0.08em',
    DESKTOP: '0.1em',
  },
  FONT_SIZE: {
    MOBILE: 'clamp(0.7rem, 2vw, 1rem)',
    TABLET: 'clamp(0.8rem, 2.5vw, 1.2rem)',
    DESKTOP: 'clamp(1rem, 3vw, 1.4rem)',
  },
} as const;