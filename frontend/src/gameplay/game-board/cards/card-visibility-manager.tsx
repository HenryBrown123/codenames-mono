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
      const newAnimation = initialState === "hidden" && !card.selected ? "deal-in" : null;
      updatedData.set(card.word, {
        state: newState,
        animation: newAnimation,
        animationStatus: newAnimation ? "pending" : undefined
      });
      hasChanges = true;
      return; // Skip transition logic for newly initialized cards
    }

    const transition = CARD_TRANSITIONS.find(
      (t) => t.from === currentData.state && t.condition(card, viewMode),
    );

    if (transition && currentData.state !== transition.to) {
      // Check if animation already played
      const hasAlreadyAnimated = 
        currentData.animation === transition.animation && 
        currentData.animationStatus === "complete";
      
      if (!hasAlreadyAnimated) {
        if (!updatedData) updatedData = new Map(currentCardData);
        
        
        updatedData.set(card.word, {
          state: transition.to,
          animation: transition.animation,
          animationStatus: "pending"
        });
        hasChanges = true;
      }
    }
  });

  return hasChanges && updatedData ? updatedData : currentCardData;
};

export const CardVisibilityManager: React.FC<CardVisibilityManagerProps> = ({
  cards,
  initialState,
}) => {
  const cardData = useCardVisibilityStore((state) => state.cardData);
  const setCardData = useCardVisibilityStore((state) => state.setCardData);
  const viewMode = useCardVisibilityStore((state) => state.viewMode);

  // Cleanup incomplete animations on unmount
  React.useEffect(() => {
    return () => {
      const currentData = useCardVisibilityStore.getState().cardData;
      const updatedData = new Map(currentData);
      let hasIncompleteAnimations = false;
      
      updatedData.forEach((data, word) => {
        if (data.animation && data.animationStatus !== "complete") {
          updatedData.set(word, {
            ...data,
            animation: null,
            animationStatus: "complete"
          });
          hasIncompleteAnimations = true;
        }
      });
      
      if (hasIncompleteAnimations) {
        useCardVisibilityStore.getState().setCardData(updatedData);
      }
    };
  }, []);

  // Process transitions in useEffect - CRITICAL!
  React.useEffect(() => {
    const newCardData = processCardTransitions(cards, cardData, viewMode, initialState);
    if (newCardData !== cardData) {
      setCardData(newCardData);
    }
  }, [cards, viewMode, initialState]);

  return null;
};