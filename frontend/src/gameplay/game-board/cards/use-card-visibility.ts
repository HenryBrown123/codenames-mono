import { useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import { useCardAnimations } from "./use-card-animations";
import type { VisualState, CardVisibilityData } from "./card-visibility-provider";

// Default visibility data to avoid creating new objects
const DEFAULT_VISIBILITY_DATA: CardVisibilityData = {
  state: "hidden" as VisualState,
  animation: null,
};

/**
 * Hook for managing card visibility state and animations
 *
 * Returns display state from store and animation registration utilities.
 * No longer handles CSS animation events - animations are WAAPI-based.
 */
export const useCardVisibility = (card: Card, index: number) => {
  // Get visibility data from store
  const visibilityData = useCardVisibilityStore(
    useCallback((state) => state.cardData.get(card.word) || DEFAULT_VISIBILITY_DATA, [card.word]),
  );

  // Get animation registration hook
  const { createAnimationRef } = useCardAnimations(card.word);

  return {
    displayState: visibilityData.state,
    isPending: visibilityData.animationStatus === "pending",
    viewMode: visibilityData.state === "visible-colored" ? "spymaster" : "normal",
    createAnimationRef,
  };
};
