import { useEffect, useMemo } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import { useAnimationRegistration } from "../../animations/use-animation-registration";
import { useAnimationEngine } from "../../animations/animation-engine-context";

/**
 * Main hook for card visibility - combines state management with animation registration
 *
 * This is the primary interface for GameCard components. It:
 * - Reads card state from the visibility store
 * - Syncs entity context to animation engine via useEffect
 * - Provides animation ref factory via the generic animation registration hook
 * - Auto-initialises cards when first rendered
 * - Exposes select action for triggering card selection animations
 */
export function useCardVisibility(card: Card, index: number) {
  const cardVisibility = useCardVisibilityStore((state) => state.cards.get(card.word));
  const viewMode = useCardVisibilityStore((state) => state.viewMode);

  const initialiseCard = useCardVisibilityStore((state) => state.initialiseCard);
  const uninitialiseCard = useCardVisibilityStore((state) => state.uninitialiseCard);
  const selectCard = useCardVisibilityStore((state) => state.selectCard);

  const engine = useAnimationEngine();

  // Build entity context - useMemo ensures we only create new object when values change
  const entityContext = useMemo(
    () => ({
      word: card.word,
      teamName: card.teamName,
      selected: card.selected,
      index,
      displayState: cardVisibility?.displayState || "visible",
      isTransitioning: cardVisibility?.isTransitioning || false,
      pendingState: cardVisibility?.pendingState,
      viewMode,
    }),
    [
      card.word,
      card.teamName,
      card.selected,
      index,
      cardVisibility?.displayState,
      cardVisibility?.isTransitioning,
      cardVisibility?.pendingState,
      viewMode,
    ],
  );

  // This hook syncs entityContext to engine via useEffect
  const { createAnimationRef } = useAnimationRegistration(card.word, entityContext);

  useEffect(() => {
    initialiseCard(card.word, card);

    return () => {
      uninitialiseCard(card.word);
    };
  }, [card.word, initialiseCard, uninitialiseCard]);

  return {
    displayState: cardVisibility?.displayState || "hidden",
    isPending: cardVisibility?.isTransitioning || false,
    viewMode,
    select: () => selectCard(card.word, engine),
    createAnimationRef,
  };
}
