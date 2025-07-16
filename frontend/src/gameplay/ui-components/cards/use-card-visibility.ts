import { useRef, useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityContext } from "./card-visibility-provider";
import type { VisualState, AnimationType } from "./card-visibility-provider";

export interface CardVisibility {
  state: VisualState;
  animation: AnimationType;
  handleAnimationStart: (e: React.AnimationEvent) => void;
  handleAnimationEnd: (e: React.AnimationEvent) => void;
}

/**
 * Hook for individual card visibility management
 * Tracks animation lifecycle and only returns animation when safe to do so
 */
export const useCardVisibility = (card: Card, _index: number): CardVisibility => {
  const { getCardVisibility } = useCardVisibilityContext();

  const visibilityData = getCardVisibility(card.word) || {
    state: "hidden" as VisualState,
    animation: null,
  };
  const prevStateRef = useRef<VisualState | null>(null);
  const activeElements = useRef<Set<EventTarget>>(new Set());

  // Derived state - pure calculation, no re-renders needed
  const isAnimating = activeElements.current.size > 0;

  // Animation event handlers - just update the Set
  const handleAnimationStart = useCallback(
    (e: React.AnimationEvent) => {
      activeElements.current.add(e.currentTarget);
      console.log("Adding element");
    },
    [activeElements],
  );

  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent) => {
      activeElements.current.delete(e.currentTarget);
      console.log("Removing element");
    },
    [activeElements],
  );

  // Only return animation if state changed AND not currently animating
  const shouldShowAnimation = visibilityData.state !== prevStateRef.current || isAnimating;

  const animation = shouldShowAnimation ? visibilityData.animation : null;

  prevStateRef.current = visibilityData.state;

  return {
    state: visibilityData.state,
    animation,
    handleAnimationStart,
    handleAnimationEnd,
  };
};
