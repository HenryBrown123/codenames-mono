import { useCallback, useEffect } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import { useAnimationRegistration } from "../../animations/use-animation-registration";
import { createWebAnimationEngine } from "@frontend/gameplay/animations";

const boardAnimationEngine = createWebAnimationEngine();

/**
 * Main hook for card visibility - combines state management with animation registration
 *
 * This is the primary interface for GameCard components. It:
 * - Reads card state from the visibility store
 * - Provides animation ref factory via the generic animation registration hook
 * - Auto-initializes cards when first rendered
 * - Exposes select action for triggering card selection animations
 */
export function useCardVisibility(card: Card, index: number) {
  const cardState = useCardVisibilityStore((state) => state.cards.get(card.word));
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const initializeCard = useCardVisibilityStore((state) => state.initializeCard);
  const selectCard = useCardVisibilityStore((state) => state.selectCard);

  const { createAnimationRef } = useAnimationRegistration(card.word, boardAnimationEngine);

  useEffect(() => {
    if (!cardState) {
      initializeCard(card.word, card);
    }
  }, [card.word, cardState, initializeCard, card]);

  return {
    displayState: cardState?.displayState || "hidden",
    isPending: cardState?.isTransitioning || false,
    viewMode,
    select: () => selectCard(card.word),
    createAnimationRef,
  };
}
