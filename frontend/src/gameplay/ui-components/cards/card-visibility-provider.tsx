/**
 * Card Visibility Provider
 *
 * Manages visibility state for all cards in a centralized store.
 * Each card subscribes to its own state changes via the useCardVisibility hook.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Card } from "@frontend/shared-types";

export type VisualState = "hidden" | "visible" | "visible-reveal-ready" | "visible-colored" | "covered";
export type AnimationType = "dealing" | "color-fade" | "covering" | null;

interface CardVisibilityState {
  getCardState: (word: string) => VisualState | undefined;
  transitionCard: (word: string, newState: VisualState) => void;
  toggleColorVisibility: () => void; // Toggle between visible and visible-colored for AR mode
}

const CardVisibilityContext = createContext<CardVisibilityState | null>(null);

interface CardVisibilityProviderProps {
  children: ReactNode;
  cards: Card[];
  initialState: VisualState;
}

/**
 * Provider that manages visibility state for all cards
 * Initializes all cards upfront to avoid render-time updates
 */
export const CardVisibilityProvider: React.FC<CardVisibilityProviderProps> = ({
  children,
  cards,
  initialState,
}) => {
  const [cardStates, setCardStates] = useState(() => {
    // Initialize all cards at provider creation
    const initial = new Map<string, VisualState>();
    cards.forEach((card) => {
      initial.set(card.word, card.selected ? "covered" : initialState);
    });
    return initial;
  });

  const getCardState = useCallback(
    (word: string) => {
      return cardStates.get(word);
    },
    [cardStates],
  );

  const transitionCard = useCallback((word: string, newState: VisualState) => {
    setCardStates((prev) => {
      const next = new Map(prev);
      next.set(word, newState);
      return next;
    });
  }, []);

  // Toggle between visible and visible-colored states for AR mode via intermediate state
  const toggleColorVisibility = useCallback(() => {
    setCardStates((prev) => {
      const next = new Map(prev);
      cards.forEach((card) => {
        const currentState = prev.get(card.word);
        
        // Only toggle cards that aren't covered and have team/card type data
        if (currentState !== "covered" && (card.cardType || card.teamName)) {
          if (currentState === "visible") {
            next.set(card.word, "visible-reveal-ready");
          } else if (currentState === "visible-reveal-ready") {
            next.set(card.word, "visible-colored");
          } else if (currentState === "visible-colored") {
            next.set(card.word, "visible");
          }
        }
      });
      return next;
    });
  }, [cards]);

  return (
    <CardVisibilityContext.Provider 
      value={{ 
        getCardState, 
        transitionCard,
        toggleColorVisibility
      }}
    >
      {children}
    </CardVisibilityContext.Provider>
  );
};

export const useCardVisibilityContext = () => {
  const context = useContext(CardVisibilityContext);
  if (!context) {
    throw new Error("useCardVisibilityContext must be used within CardVisibilityProvider");
  }
  return context;
};
