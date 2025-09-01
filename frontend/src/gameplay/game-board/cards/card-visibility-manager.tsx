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
  // Step 1: Track what's happening with the store
  console.log("🔍 PROCESS", {
    scene: window.location.pathname,
    cardsWithSelection: cards.filter(c => c.selected).map(c => c.word),
    storeSize: currentCardData.size,
    initialState
  });
  
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
      
      // Step 3: Track specific card animations
      if (card.selected && transition.animation === "cover-card") {
        console.log("⚠️ RE-ANIMATION", {
          card: card.word,
          from: currentData.state,
          to: transition.to,
          currentAnimation: currentData.animation
        });
      }
      
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

  // Step 2: Mount/unmount tracking
  React.useEffect(() => {
    console.log("🟢 CardVisibilityManager MOUNTED", { initialState });
    return () => {
      console.log("🔴 CardVisibilityManager UNMOUNTED");
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