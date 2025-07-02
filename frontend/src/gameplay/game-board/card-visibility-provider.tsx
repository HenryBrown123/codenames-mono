/**
 * Card Visibility System
 * 
 * Problem: When managing card animations at the board level, updating any single card's
 * visibility state causes the entire board (and all 25 cards) to re-render. This results
 * in 25x more renders than necessary during dealing animations.
 * 
 * Solution: This system implements a "connected components" pattern where:
 * 1. State is centralized in a provider (for persistence across mounts/unmounts)
 * 2. Each card subscribes only to its own state changes via useCardVisibility hook
 * 3. When a card's state changes, only that specific card re-renders
 * 
 * Benefits:
 * - Dealing 25 cards = 25 renders (instead of 625)
 * - State persists when cards unmount/remount
 * - Clean separation between state management and render optimization
 * - Board component never re-renders during card animations
 * 
 * Architecture:
 * - CardVisibilityProvider: Centralized state storage for all cards
 * - useCardVisibility: Card-level hook that subscribes to individual card state
 * - GameCard: Component that uses the hook for its own visibility
 * - Board: Simply wraps children in provider, no visibility logic needed
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type VisualState = 'hidden' | 'visible' | 'visible-colored' | 'covered';
export type AnimationType = 'dealing' | 'color-fade' | 'covering' | null;

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
    setCards(prev => {
      if (prev.has(word)) return prev; // Already registered
      const next = new Map(prev);
      next.set(word, initialState);
      return next;
    });
  }, []);
  
  const getCardState = useCallback((word: string) => {
    return cards.get(word);
  }, [cards]);
  
  const transitionCard = useCallback((word: string, newState: VisualState) => {
    setCards(prev => {
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
    throw new Error('useCardVisibilityContext must be used within CardVisibilityProvider');
  }
  return context;
};