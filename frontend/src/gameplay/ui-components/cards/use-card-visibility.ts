/**
 * Card Visibility Hook
 *
 * Card-level hook that manages individual card state transitions and animations.
 * Connects to the CardVisibilityProvider to maintain state across renders.
 */

import { useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityContext } from "./card-visibility-provider";
import type { VisualState, AnimationType } from "./card-visibility-provider";

interface CardTransition {
  from: VisualState;
  to: VisualState;
  animation: AnimationType;
  condition: (card: Card, view: { showTeamColors: boolean }) => boolean;
}

/**
 * Simplified state transitions
 */
const CARD_TRANSITIONS: CardTransition[] = [
  // Cards appear with dealing animation
  {
    from: "hidden",
    to: "visible",
    animation: "dealing",
    condition: () => true,
  },
  // Cards reveal their team colors when in spymaster view
  {
    from: "visible",
    to: "visible-colored",
    animation: "color-fade",
    condition: (card, view) => view.showTeamColors && !!(card.cardType || card.teamName),
  },
  // Cards hide their team colors when leaving spymaster view
  {
    from: "visible-colored",
    to: "visible",
    animation: "color-fade",
    condition: (_, view) => !view.showTeamColors,
  },
  // Cards cover when selected (from neutral state)
  {
    from: "visible",
    to: "covered",
    animation: "covering",
    condition: (card) => card.selected,
  },
  // Cards cover when selected (from colored state)
  {
    from: "visible-colored",
    to: "covered",
    animation: "covering",
    condition: (card) => card.selected,
  },
];

export interface CardVisibility {
  state: VisualState;
  animation: AnimationType;
  handleAnimationEnd: () => void;
}

/**
 * Hook for individual card visibility management
 * Cards are pre-registered in the provider, so this just reads/updates state
 */
export const useCardVisibility = (
  card: Card,
  _index: number,
  initialState: VisualState = "visible",
): CardVisibility => {
  const { getCardState, transitionCard, view } = useCardVisibilityContext();

  // Get current state - cards are pre-registered in provider
  const state = getCardState(card.word) || initialState;

  // Find applicable transition based on current state and card properties
  const transition = CARD_TRANSITIONS.find((t) => t.from === state && t.condition(card, view));

  // Animation completion handler that encapsulates completion logic
  const handleAnimationEnd = useCallback(() => {
    if (transition) {
      transitionCard(card.word, transition.to);
    }
  }, [transition, card.word, transitionCard]);

  return {
    state,
    animation: transition?.animation || null,
    handleAnimationEnd,
  };
};
