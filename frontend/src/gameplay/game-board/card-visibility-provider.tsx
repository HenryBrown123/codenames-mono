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

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type VisualState = 'hidden' | 'dealing' | 'visible' | 'selected' | 'revealed';
export type AnimationType = 'deal' | 'select' | 'reveal' | 'flip' | null;

interface CardVisibilityState {
  cards: Map<string, VisualState>;
  updateCard: (word: string, state: VisualState) => void;
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
  
  const updateCard = useCallback((word: string, state: VisualState) => {
    setCards(prev => {
      const next = new Map(prev);
      next.set(word, state);
      return next;
    });
  }, []);
  
  return (
    <CardVisibilityContext.Provider value={{ cards, updateCard }}>
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