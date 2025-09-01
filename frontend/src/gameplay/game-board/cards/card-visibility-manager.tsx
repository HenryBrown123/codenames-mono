import React from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import { CARD_TRANSITIONS } from "./card-visibility-provider";
import type { VisualState, CardVisibilityData } from "./card-visibility-provider";

interface CardVisibilityManagerProps {
  cards: Card[];
  initialState: VisualState;
}

/**
 * Process card transitions based on state machine
 */
const processCardTransitions = (
  cards: Card[],
  currentCardData: Map<string, CardVisibilityData>,
  viewMode: "player" | "spymaster",
  initialState: VisualState = "visible"
): Map<string, CardVisibilityData> => {
  let updatedData: Map<string, CardVisibilityData> | null = null;
  let hasChanges = false;

  cards.forEach((card) => {
    const currentData = currentCardData.get(card.word);

    if (!currentData) {
      if (!updatedData) updatedData = new Map(currentCardData);
      const newState = card.selected ? "visible-covered" : initialState;
      updatedData.set(card.word, {
        state: newState,
        animation: initialState === "hidden" && !card.selected ? "deal-in" : null,
      });
      hasChanges = true;
      return; // Skip transition logic for newly initialized cards
    }

    const transition = CARD_TRANSITIONS.find(
      (t) => t.from === currentData.state && t.condition(card, viewMode),
    );

    if (transition && currentData.state !== transition.to) {
      if (!updatedData) updatedData = new Map(currentCardData);
      updatedData.set(card.word, {
        state: transition.to,
        animation: transition.animation,
      });
      hasChanges = true;
    }
  });

  return hasChanges && updatedData ? updatedData : currentCardData;
};

export const CardVisibilityManager: React.FC<CardVisibilityManagerProps> = ({
  cards,
  initialState,
}) => {
  console.log("CardVisibilityManager render", { initialState });
  
  const cardData = useCardVisibilityStore((state) => state.cardData);
  const setCardData = useCardVisibilityStore((state) => state.setCardData);
  const viewMode = useCardVisibilityStore((state) => state.viewMode);

  // Process transitions in useEffect - CRITICAL!
  React.useEffect(() => {
    const newCardData = processCardTransitions(cards, cardData, viewMode, initialState);
    if (newCardData !== cardData) {
      setCardData(newCardData);
    }
  }, [cards, viewMode, initialState]);

  return null;
};