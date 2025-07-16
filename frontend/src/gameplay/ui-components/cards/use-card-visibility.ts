/**
 * Card Visibility Hook
 *
 * Hook that reads card visibility state from the provider and detects state changes
 * to determine when animations should play.
 */

import { useRef } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityContext } from "./card-visibility-provider";
import type { VisualState, AnimationType } from "./card-visibility-provider";

export interface CardVisibility {
  state: VisualState;
  animation: AnimationType;
  handleAnimationEnd: () => void;
}

/**
 * Hook for individual card visibility management
 * Reads state from provider and detects changes to return animations
 */
export const useCardVisibility = (
  card: Card,
  _index: number,
): CardVisibility => {
  const { getCardVisibility } = useCardVisibilityContext();
  
  // Track previous state for this hook instance
  const prevStateRef = useRef<VisualState | null>(null);
  
  // Get current visibility data from provider
  const visibilityData = getCardVisibility(card.word) || {
    state: "hidden" as VisualState,
    animation: null,
  };
  
  // Determine if we should return an animation
  let animation: AnimationType = null;
  if (prevStateRef.current !== null && prevStateRef.current !== visibilityData.state) {
    // State changed for this hook instance, return the animation
    animation = visibilityData.animation;
  }
  
  // Update previous state for next render
  prevStateRef.current = visibilityData.state;
  
  // Fire-and-forget animation handler
  const handleAnimationEnd = () => {
    // Animation completed, no action needed
    // The state has already been transitioned by the provider
  };
  
  return {
    state: visibilityData.state,
    animation,
    handleAnimationEnd,
  };
};