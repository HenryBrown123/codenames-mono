import { useCallback } from 'react';
import { useCardVisibilityContext, VisualState, AnimationType } from './card-visibility-provider';
import type { Card } from '@frontend/shared-types';

interface CardTransition {
  from: VisualState;
  to: VisualState;
  animation: AnimationType;
  condition: (card: Card) => boolean;
}

const CARD_TRANSITIONS: CardTransition[] = [
  // Cards appear with dealing animation
  {
    from: 'hidden',
    to: 'visible',
    animation: 'dealing',
    condition: () => true,
  },
  // Cards reveal their team when data arrives (codemaster view)
  {
    from: 'visible',
    to: 'visible-colored',
    animation: 'color-fade',
    condition: (card) => !!card.teamName && !card.selected,
  },
  // Cards cover when selected (from neutral state)
  {
    from: 'visible',
    to: 'covered',
    animation: 'covering',
    condition: (card) => card.selected,
  },
  // Cards cover when selected (from colored state)
  {
    from: 'visible-colored',
    to: 'covered',
    animation: 'covering',
    condition: (card) => card.selected,
  },
];

export interface CardVisibility {
  state: VisualState;
  animation: AnimationType;
  completeTransition: () => void;
}

/**
 * Hook for individual card visibility management
 */
export const useCardVisibility = (
  card: Card, 
  index: number, 
  initialState: VisualState = 'visible'
): CardVisibility => {
  const { registerCard, getCardState, transitionCard } = useCardVisibilityContext();
  
  // Get current state or register if new
  const currentState = getCardState(card.word);
  if (!currentState) {
    registerCard(card.word, initialState);
    return { 
      state: initialState, 
      animation: null, 
      completeTransition: () => {} 
    };
  }
  
  // Find applicable transition based on current state and card properties
  const transition = CARD_TRANSITIONS.find(t => 
    t.from === currentState && t.condition(card)
  );
  
  // Animation completion handler
  const completeTransition = useCallback(() => {
    if (transition) {
      transitionCard(card.word, transition.to);
    }
  }, [transition, card.word, transitionCard]);
  
  return {
    state: currentState,
    animation: transition?.animation || null,
    completeTransition
  };
};