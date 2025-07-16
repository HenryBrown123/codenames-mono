import { useRef, useMemo } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityContext } from "./card-visibility-provider";
import type { VisualState, AnimationType } from "./card-visibility-provider";

export interface CardVisibility {
  state: VisualState;
  animation: AnimationType;
}

/**
 * Hook for individual card visibility management
 * Reads state from provider and detects changes to return animations
 */
export const useCardVisibility = (card: Card, _index: number): CardVisibility => {
  const { getCardVisibility } = useCardVisibilityContext();
  const prevStateRef = useRef<VisualState | null>(null);

  const visibilityData = getCardVisibility(card.word) || {
    state: "hidden",
    animation: null,
  };

  /* onlny animate if visibility state changes */
  const shouldAnimate = prevStateRef.current !== visibilityData.state;

  prevStateRef.current = visibilityData.state;

  return {
    state: visibilityData.state,
    animation: shouldAnimate ? visibilityData.animation : null,
  };
};
