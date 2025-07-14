/**
 * Card Visibility Provider
 *
 * Manages visibility state for all cards in a centralized store.
 * Each card subscribes to its own state changes via the useCardVisibility hook.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Card } from "@frontend/shared-types";

export type VisualState =
  | "hidden"
  | "visible"
  | "visible-reveal-ready"
  | "visible-colored"
  | "visible-reveal-hide"
  | "covered";
export type AnimationType = "dealing" | "color-fade" | "covering" | null;

interface CardVisibilityState {
  getCardState: (word: string) => VisualState | undefined;
  transitionCard: (word: string, newState: VisualState) => void;
  triggerVisibilityChange: (trigger: "reveal" | "hide" | "reset") => void;
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

  // Explicit visibility state triggers for AR mode
  const triggerVisibilityChange = useCallback(
    (trigger: "reveal" | "hide" | "reset") => {
      setCardStates((prev) => {
        const next = new Map(prev);
        console.log("trigger");

        switch (trigger) {
          case "reveal":
            cards.forEach((card) => {
              const currentState = prev.get(card.word);
              if (currentState === "visible" && (card.cardType || card.teamName)) {
                next.set(card.word, "visible-reveal-ready");
              }
            });
            break;

          case "hide":
            cards.forEach((card) => {
              const currentState = prev.get(card.word);
              console.log(currentState);
              if (currentState === "visible-colored") {
                next.set(card.word, "visible-reveal-hide");
              }
            });
            break;

          case "reset":
            cards.forEach((card) => {
              if (prev.get(card.word) !== "covered") {
                next.set(card.word, card.selected ? "covered" : "visible");
              }
            });
            break;
        }

        return next;
      });
    },
    [cards],
  );

  return (
    <CardVisibilityContext.Provider
      value={{
        getCardState,
        transitionCard,
        triggerVisibilityChange,
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
