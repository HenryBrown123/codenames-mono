import { useEffect } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import { CARD_TRANSITIONS } from "./card-visibility-provider";
import type { VisualState, CardVisibilityData } from "./card-visibility-provider";

interface CardVisibilityManagerProps {
  cards: Card[];
  initialState: VisualState;
}

/**
 * Contains all state machine logic - just moved from provider
 * This runs every render just like before
 */
export const CardVisibilityManager: React.FC<CardVisibilityManagerProps> = ({
  cards,
  initialState,
}) => {
  const cardData = useCardVisibilityStore((state) => state.cardData);
  const setCardData = useCardVisibilityStore((state) => state.setCardData);
  const viewMode = useCardVisibilityStore((state) => state.viewMode);

  // Initialize cards if needed (same logic as provider)
  useEffect(() => {
    const initial = new Map<string, CardVisibilityData>();
    cards.forEach((card) => {
      const cardState = card.selected ? "visible-covered" : initialState;
      initial.set(card.word, {
        state: cardState,
        animation: null,
      });
    });
    setCardData(initial);
  }, []); // Only on mount

  // Run state machine transitions during render (EXACT same logic as provider)
  let hasChanges = false;
  const updatedData = new Map(cardData);

  cards.forEach((card, index) => {
    const currentData = updatedData.get(card.word);
    if (!currentData) {
      // New card, initialize it
      const newState = card.selected ? "visible-covered" : initialState;
      updatedData.set(card.word, {
        state: newState,
        animation: null,
      });
      hasChanges = true;
      return;
    }

    // Find applicable transition (existing logic)
    const transition = CARD_TRANSITIONS.find(
      (t) => t.from === currentData.state && t.condition(card, viewMode),
    );

    if (transition && currentData.state !== transition.to) {
      updatedData.set(card.word, {
        state: transition.to,
        animation: transition.animation,
      });
      hasChanges = true;
    }
  });

  // Only update state if there were changes
  if (hasChanges) {
    setCardData(updatedData);
  }

  return null; // This component just manages state
};