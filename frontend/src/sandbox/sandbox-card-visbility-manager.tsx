// frontend/src/sandbox/sandbox-card-visibility-manager.tsx
import { useEffect, useRef } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "../gameplay/game-board/cards/card-visibility-store";

interface SandboxCardVisibilityManagerProps {
  cards: Card[];
  initialState: "hidden" | "visible";
}

/**
 * Sandbox version of CardVisibilityManager that triggers Zustand store updates
 * This mimics how you'd use it in the main app
 */
export const SandboxCardVisibilityManager: React.FC<SandboxCardVisibilityManagerProps> = ({
  cards,
  initialState,
}) => {
  const setCardData = useCardVisibilityStore((state) => state.setCardData);
  const cardData = useCardVisibilityStore((state) => state.cardData);
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const prevCards = useRef(cards);
  const prevViewMode = useRef(viewMode);

  // Process cards whenever they change or view mode changes
  useEffect(() => {
    console.log("[SandboxCardVisibilityManager] Processing cards:", {
      cardsChanged: cards !== prevCards.current,
      viewModeChanged: viewMode !== prevViewMode.current,
      cardCount: cards.length,
    });

    const updatedData = new Map();
    let hasChanges = false;

    cards.forEach((card) => {
      const currentData = cardData.get(card.word);

      if (!currentData) {
        // New card
        const cardState = card.selected ? "visible-covered" : initialState;
        updatedData.set(card.word, {
          state: cardState,
          animation: initialState === "hidden" ? "deal-in" : null,
        });
        hasChanges = true;
        console.log(`[CardVisibility] New card ${card.word}: ${cardState}`);
      } else {
        // Check for state changes
        let newState = currentData.state;
        let newAnimation = currentData.animation;

        // Handle selection
        if (card.selected && currentData.state !== "visible-covered") {
          newState = "visible-covered";
          newAnimation = "cover-card";
          hasChanges = true;
          console.log(`[CardVisibility] ${card.word}: covering`);
        }

        // Handle spymaster view toggle
        if (!card.selected) {
          if (viewMode === "spymaster" && currentData.state === "visible") {
            newState = "visible-colored";
            newAnimation = "spymaster-reveal-in";
            hasChanges = true;
            console.log(`[CardVisibility] ${card.word}: revealing color`);
          } else if (viewMode === "player" && currentData.state === "visible-colored") {
            newState = "visible";
            newAnimation = "spymaster-reveal-out";
            hasChanges = true;
            console.log(`[CardVisibility] ${card.word}: hiding color`);
          }
        }

        updatedData.set(card.word, {
          state: newState,
          animation: newAnimation,
        });
      }
    });

    if (hasChanges) {
      console.log("[CardVisibility] Updating store with changes");
      setCardData(updatedData);
    }

    prevCards.current = cards;
    prevViewMode.current = viewMode;
  }, [cards, viewMode, initialState]);

  return null;
};

// Hook to use in sandbox cards
export const useSandboxCardVisibility = (card: Card) => {
  const cardData = useCardVisibilityStore((state) => state.cardData.get(card.word));
  const setCardData = useCardVisibilityStore((state) => state.setCardData);
  const allCardData = useCardVisibilityStore((state) => state.cardData);

  const clearAnimation = () => {
    const updated = new Map(allCardData);
    const current = updated.get(card.word);
    if (current) {
      updated.set(card.word, { ...current, animation: null });
      setCardData(updated);
    }
  };

  return {
    state: cardData?.state || "hidden",
    animation: cardData?.animation || null,
    clearAnimation,
  };
};
