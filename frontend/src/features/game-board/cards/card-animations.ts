import type { AnimationDefinition } from "../../animations/types";
import { createAnimationEngine } from "../../animations/waapi-engine";

/**
 * Card container animations
 * Applied to: Outer card wrapper element
 * Converted from animations.css @keyframes dealIn
 */
export const cardContainer: Record<string, AnimationDefinition> = {
  "animate-deal": {
    keyframes: [
      {
        transform: "translateX(-100vw) translateY(-100vh) rotate(-6deg)",
        opacity: "0",
        offset: 0,
      },
      {
        transform: "translateX(0) translateY(0) rotate(2deg)",
        opacity: "1",
        offset: 0.6,
      },
      {
        transform: "translateX(0) translateY(0) rotate(0)",
        opacity: "1",
        offset: 1,
      },
    ],
    options: {
      duration: 700,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      fill: "forwards",
    },
  },
};

/**
 * Card cover (revealed state)
 * Applied to: .coverCard element
 * Converted from animations.css @keyframes coverCard
 */
export const cardCover: Record<string, AnimationDefinition> = {
  "reveal-card": {
    keyframes: [
      {
        transform: "translateX(-100vw) translateY(-100vh) rotate(-6deg)",
        opacity: "0",
        offset: 0,
      },
      {
        transform: "translateX(0) translateY(0) rotate(2deg)",
        opacity: "1",
        offset: 0.6,
      },
      {
        transform: "translateX(0) translateY(0) rotate(0)",
        opacity: "1",
        offset: 1,
      },
    ],
    options: {
      duration: 3000,
      easing: "ease-out",
      fill: "forwards",
    },
  },
};

/**
 * Spymaster overlay
 * Applied to: .spymasterOverlay element
 * Converted from animations.css @keyframes spymasterReveal
 */
export const spymasterOverlay: Record<string, AnimationDefinition> = {
  "reveal-colors": {
    keyframes: [
      {
        opacity: "0",
        transform: "scale(0.95)",
      },
      {
        opacity: "1",
        transform: "scale(1)",
      },
    ],
    options: {
      duration: 600,
      easing: "ease-in",
      fill: "forwards",
    },
  },
  "hide-colors": {
    keyframes: [
      {
        opacity: "1",
        transform: "scale(1)",
      },
      {
        opacity: "0",
        transform: "scale(0.95)",
      },
    ],
    options: {
      duration: 600,
      easing: "ease-in",
      fill: "forwards",
    },
  },
};

/**
 * Card word text
 * Applied to: .cardWord element
 */
export const cardWord: Record<string, AnimationDefinition> = {};

/**
 * Team badge
 * Applied to: Team color indicator (if visible in spymaster mode)
 */
export const cardBadge: Record<string, AnimationDefinition> = {};

/**
 * Card-specific animation engine instance
 * This is the singleton that manages all card animations
 * Import this in the store to execute animations
 */
export const cardAnimationEngine = createAnimationEngine();
