import { useState, useCallback } from 'react';
import { Card } from '@frontend/shared-types';

/**
 * Visual states for cards
 */
export type VisualState = 'hidden' | 'visible' | 'visible-colored' | 'covered';

/**
 * Animation types
 */
export type Animation = 'dealing' | 'color-fade' | 'covering';

/**
 * State transition definition
 */
interface StateTransition {
  from: VisualState;
  to: VisualState;
  animation: Animation;
  condition: (card: Card) => boolean;
}

/**
 * Card visibility info
 */
export interface CardVisibility {
  state: VisualState;
  animation: Animation | null;
  completeTransition: () => void;
}

/**
 * Generic card transitions based on data
 */
const CARD_TRANSITIONS: StateTransition[] = [
  // Cards appear
  {
    from: 'hidden',
    to: 'visible',
    animation: 'dealing',
    condition: () => true
  },
  // Cards reveal their team when data arrives
  {
    from: 'visible',
    to: 'visible-colored',
    animation: 'color-fade',
    condition: (card) => !!card.teamName && !card.selected
  },
  // Cards cover when selected
  {
    from: 'visible',
    to: 'covered',
    animation: 'covering',
    condition: (card) => card.selected
  },
  {
    from: 'visible-colored',
    to: 'covered',
    animation: 'covering',
    condition: (card) => card.selected
  }
];

interface UseCardVisibilityProps {
  cards: Card[];
  initialState?: VisualState;
}

/**
 * Hook that manages card visual states and animations
 */
export function useCardVisibility({ 
  cards, 
  initialState = 'visible' 
}: UseCardVisibilityProps) {
  // Track visual state by card word
  const [cardStates, setCardStates] = useState<Map<string, VisualState>>(() => {
    const initial = new Map<string, VisualState>();
    cards.forEach(card => {
      // Respect selected state even on mount
      if (card.selected) {
        initial.set(card.word, 'covered');
      } else if (initialState === 'visible' && card.teamName) {
        // If starting visible with team data, go straight to colored
        initial.set(card.word, 'visible-colored');
      } else {
        initial.set(card.word, initialState);
      }
    });
    return initial;
  });

  /**
   * Get the current visual state and animation for a card
   */
  const getCardVisibility = useCallback((card: Card): CardVisibility => {
    const currentState = cardStates.get(card.word) || initialState;
    
    // Find applicable transition from current state
    const transition = CARD_TRANSITIONS.find(t => 
      t.from === currentState && t.condition(card)
    );
    
    return {
      state: currentState,
      animation: transition?.animation || null,
      completeTransition: transition ? () => {
        setCardStates(prev => {
          const next = new Map(prev);
          next.set(card.word, transition.to);
          return next;
        });
      } : () => {}
    };
  }, [cardStates, initialState]);
  
  return {
    getCardVisibility,
  };
}