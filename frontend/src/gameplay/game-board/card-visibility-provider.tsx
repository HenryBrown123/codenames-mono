/**
 * Card Visibility Provider
 *
 * Manages visibility state for all cards in a centralized store.
 * Each card subscribes to its own state changes via the useCardVisibility hook.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type VisualState = "hidden" | "visible" | "visible-colored" | "covered";
export type AnimationType = "dealing" | "color-fade" | "covering" | null;

interface CardVisibilityState {
  registerCard: (word: string, initialState: VisualState) => void;
  getCardState: (word: string) => VisualState | undefined;
  transitionCard: (word: string, newState: VisualState) => void;
}

const CardVisibilityContext = createContext<CardVisibilityState | null>(null);

interface CardVisibilityProviderProps {
  children: ReactNode;
}

/**
 * Provider that manages visibility state for all cards
 */
export const CardVisibilityProvider: React.FC<CardVisibilityProviderProps> = ({ children }) => {
  const [cards, setCards] = useState(new Map<string, VisualState>());

  const registerCard = useCallback((word: string, initialState: VisualState) => {
    setCards((prev) => {
      if (prev.has(word)) return prev; // Already registered
      const next = new Map(prev);
      next.set(word, initialState);
      return next;
    });
  }, []);

  const getCardState = useCallback(
    (word: string) => {
      return cards.get(word);
    },
    [cards],
  );

  const transitionCard = useCallback((word: string, newState: VisualState) => {
    setCards((prev) => {
      const next = new Map(prev);
      next.set(word, newState);
      return next;
    });
  }, []);

  return (
    <CardVisibilityContext.Provider value={{ registerCard, getCardState, transitionCard }}>
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
