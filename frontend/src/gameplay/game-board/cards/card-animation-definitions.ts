/** Animation definition for Web Animations API */
export interface AnimationDefinition {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

/**
 * Deal animation for card container
 *
 * Based on sandbox implementation. Cards fall from above with rotation.
 * Stagger is handled by the engine using card index.
 */
export const dealInAnimation: AnimationDefinition = {
  keyframes: [
    {
      opacity: '0',
      transform: 'translateY(-100px) rotate(-15deg) scale(0.5)',
      offset: 0,
    },
    {
      opacity: '0.5',
      transform: 'translateY(-30px) rotate(-5deg) scale(0.8)',
      offset: 0.5,
    },
    {
      opacity: '1',
      transform: 'translateY(0) rotate(0deg) scale(1)',
      offset: 1,
    },
  ],
  options: {
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards',
  },
};

/**
 * Cover card flip animation
 *
 * Card flips to reveal team color on the back.
 */
export const coverCardAnimation: AnimationDefinition = {
  keyframes: [
    { transform: 'rotateY(-180deg) scale(0)' },
    { transform: 'rotateY(-90deg) scale(0.5)' },
    { transform: 'rotateY(0deg) scale(1)' },
  ],
  options: {
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards',
  },
};

/**
 * Spymaster color reveal animation
 *
 * Color overlay fades in to show team colors.
 */
export const spymasterRevealAnimation: AnimationDefinition = {
  keyframes: [
    {
      opacity: '0',
      transform: 'scale(0.8) translateY(-10px)',
    },
    {
      opacity: '1',
      transform: 'scale(1) translateY(0)',
    },
  ],
  options: {
    duration: 400,
    delay: 100,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards',
  },
};

/**
 * Spymaster color hide animation
 *
 * Color overlay fades out when switching back to normal view.
 */
export const spymasterHideAnimation: AnimationDefinition = {
  keyframes: [
    { opacity: '1', transform: 'scale(1)' },
    { opacity: '0', transform: 'scale(0.8)' },
  ],
  options: {
    duration: 200,
    fill: 'forwards',
  },
};

/**
 * Container animations grouped by event name
 */
export const cardContainerAnimations = {
  deal: dealInAnimation,
};

/**
 * Cover layer animations grouped by event name
 */
export const coverLayerAnimations = {
  select: coverCardAnimation,
};

/**
 * Spymaster overlay animations grouped by event name
 */
export const spymasterOverlayAnimations = {
  'reveal-colors': spymasterRevealAnimation,
  'hide-colors': spymasterHideAnimation,
};

/**
 * Special animations for assassin cards
 */
export const assassinSelectAnimation: AnimationDefinition = {
  keyframes: [
    {
      filter: 'brightness(1) saturate(1)',
      transform: 'scale(1)',
    },
    {
      filter: 'brightness(2) saturate(0)',
      transform: 'scale(1.1)',
    },
    {
      filter: 'brightness(0.5) saturate(2)',
      transform: 'scale(0.95)',
    },
    {
      filter: 'brightness(1) saturate(1)',
      transform: 'scale(1)',
    },
  ],
  options: {
    duration: 800,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards',
  },
};

export const cardContainerAnimationsAssassin = {
  ...cardContainerAnimations,
  select: assassinSelectAnimation,
};
