/**
 * Card animation definitions converted from CSS to WAAPI
 *
 * Source: frontend/src/style/animations.css
 *
 * Each animation definition matches the original CSS keyframes exactly.
 */

import type { AnimationDefinition } from '../../../animations/animation-types';

/**
 * Deal-in animation
 * Original CSS: @keyframes dealIn in animations.css
 *
 * Visual: Card flies in from top-left with rotation
 * Duration: 700ms
 * Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * Stagger: 75ms between cards (handled by engine via index * 75ms)
 */
export const dealInAnimation: AnimationDefinition = {
  keyframes: [
    {
      offset: 0,
      transform: 'translateX(-100vw) translateY(-100vh) rotate(-6deg)',
      opacity: '0',
    },
    {
      offset: 0.6,
      transform: 'translateX(0) translateY(0) rotate(2deg)',
      opacity: '1',
    },
    {
      offset: 1,
      transform: 'translateX(0) translateY(0) rotate(0)',
      opacity: '1',
    },
  ],
  options: {
    duration: 700,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards',
  },
};

/**
 * Cover-card animation
 * Original CSS: @keyframes coverCard in animations.css
 *
 * Visual: Cover card flies in from top-left with rotation (same as dealIn)
 * Duration: 3000ms (from CSS: 3s)
 * Easing: ease-out (from CSS)
 */
export const coverCardAnimation: AnimationDefinition = {
  keyframes: [
    {
      offset: 0,
      transform: 'translateX(-100vw) translateY(-100vh) rotate(-6deg)',
      opacity: '0',
    },
    {
      offset: 0.6,
      transform: 'translateX(0) translateY(0) rotate(2deg)',
      opacity: '1',
    },
    {
      offset: 1,
      transform: 'translateX(0) translateY(0) rotate(0)',
      opacity: '1',
    },
  ],
  options: {
    duration: 3000,
    easing: 'ease-out',
    fill: 'forwards',
  },
};

/**
 * Spymaster reveal animation
 * Original CSS: @keyframes spymasterReveal in animations.css
 *
 * Visual: Color overlay fades in and scales up
 * Duration: 600ms (from CSS)
 * Easing: ease-in (from CSS)
 */
export const spymasterRevealAnimation: AnimationDefinition = {
  keyframes: [
    {
      offset: 0,
      opacity: '0',
      transform: 'scale(0.95)',
    },
    {
      offset: 1,
      opacity: '1',
      transform: 'scale(1)',
    },
  ],
  options: {
    duration: 600,
    easing: 'ease-in',
    fill: 'forwards',
  },
};

/**
 * Aggregated animation sets for easy registration
 */

export const cardContainerAnimations = {
  'deal-in': dealInAnimation,
};

export const coverLayerAnimations = {
  'cover-card': coverCardAnimation,
};

export const spymasterOverlayAnimations = {
  'spymaster-reveal-in': spymasterRevealAnimation,
  'spymaster-reveal-out': {
    ...spymasterRevealAnimation,
    options: {
      ...spymasterRevealAnimation.options,
      direction: 'reverse',
    },
  } as AnimationDefinition,
};
