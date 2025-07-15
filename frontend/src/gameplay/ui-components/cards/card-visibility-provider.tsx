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
  | "visible-colored"
  | "visible-covered";
export type AnimationType = "dealing" | "color-fade" | "covering" | null;

interface VisibilityTriggers {
  reveal: (active: boolean) => void;
  toggleSpymasterView: () => void;
}

interface CardVisibilityState {
  getCardState: (word: string) => VisualState | undefined;
  transitionCard: (word: string, newState: VisualState) => void;
  triggers: VisibilityTriggers;
  viewMode: 'player' | 'spymaster';
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
      initial.set(card.word, card.selected ? "visible-covered" : initialState);
    });
    return initial;
  });
  
  const [viewMode, setViewMode] = useState<'player' | 'spymaster'>('player');

  const getCardState = useCallback(
    (word: string) => {
      return cardStates.get(word);
    },
    [cardStates],
  );

  const transitionCard = useCallback((word: string, newState: VisualState) => {
    console.log('TRANSITIONING CARD:', word, 'to state:', newState);
    setCardStates((prev) => {
      const next = new Map(prev);
      next.set(word, newState);
      return next;
    });
  }, []);

  // Simplified triggers object
  const triggers = {
    reveal: useCallback((active: boolean) => {
      console.log('REVEAL CALLED with active:', active);
      setViewMode(active ? 'spymaster' : 'player');
    }, []),
    toggleSpymasterView: useCallback(() => {
      console.log('TOGGLING SPYMASTER VIEW');
      setViewMode(prev => {
        const next = prev === 'spymaster' ? 'player' : 'spymaster';
        console.log('ViewMode changing from', prev, 'to', next);
        return next;
      });
    }, []),
  };

  return (
    <CardVisibilityContext.Provider
      value={{
        getCardState,
        transitionCard,
        triggers,
        viewMode,
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
