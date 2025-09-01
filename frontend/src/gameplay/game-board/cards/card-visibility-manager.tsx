import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import { CARD_TRANSITIONS } from "./card-visibility-provider";
import type { VisualState } from "./card-visibility-provider";

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

  // Process everything in render - no useEffect needed
  let hasChanges = false;
  const updatedData = new Map(cardData);

  cards.forEach((card) => {
    const currentData = updatedData.get(card.word);
    
    if (!currentData) {
      // New card initialization - handle it here instead of useEffect
      const newState = card.selected ? "visible-covered" : initialState;
      updatedData.set(card.word, {
        state: newState,
        animation: initialState === "hidden" && !card.selected ? "deal-in" : null,
      });
      hasChanges = true;
      return; // Skip transition logic for newly initialized cards
    }

    // Find applicable transition for existing cards
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

  return null;
};