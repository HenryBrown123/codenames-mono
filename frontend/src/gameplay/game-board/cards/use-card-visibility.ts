import { useEffect } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import { useAnimationRegistration } from "../../animations/use-animation-registration";
import { useAnimationEngine } from "../../animations/animation-engine-context";

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
  const cardVisibility = useCardVisibilityStore((state) => state.cards.get(card.word));
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const initializeCard = useCardVisibilityStore((state) => state.initializeCard);
  const selectCard = useCardVisibilityStore((state) => state.selectCard);

  const engine = useAnimationEngine();

  const { createAnimationRef } = useAnimationRegistration(card.word);

  useEffect(() => {
    initializeCard(card.word, card);
  }, [card.word, initializeCard, card]);

  return {
    displayState: cardVisibility?.displayState || "hidden",
    isPending: cardVisibility?.isTransitioning || false,
    viewMode,
    select: () => selectCard(card.word, engine),
    createAnimationRef,
  };
}
