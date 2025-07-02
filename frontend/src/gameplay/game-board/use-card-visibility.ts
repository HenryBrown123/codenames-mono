import { useRef, useCallback } from 'react';
import { useCardVisibilityContext, VisualState, AnimationType } from './card-visibility-provider';
import type { Card } from '@frontend/shared-types';

interface CardTransition {
  from: VisualState;
  to: VisualState;
  condition: (card: Card) => boolean;
  animation: AnimationType;
}

const CARD_TRANSITIONS: CardTransition[] = [
  {
    from: 'hidden',
    to: 'dealing',
    condition: () => true,
    animation: 'deal',
  },
  {
    from: 'dealing',
    to: 'visible',
    condition: () => true,
    animation: null,
  },
  {
    from: 'visible',
    to: 'selected',
    condition: (card) => card.selected,
    animation: 'select',
  },
  {
    from: 'selected',
    to: 'revealed',
    condition: (card) => card.selected && card.cardType !== undefined,
    animation: 'reveal',
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
  const { cards, updateCard } = useCardVisibilityContext();
  const currentState = cards.get(card.word) || initialState;
  
  // Initialize this card's state if not already in provider
  const isInitialized = useRef(false);
  if (!isInitialized.current && !cards.has(card.word)) {
    updateCard(card.word, initialState);
    isInitialized.current = true;
  }
  
  // Find applicable transition based on current state and card properties
  const transition = CARD_TRANSITIONS.find(t => 
    t.from === currentState && t.condition(card)
  );
  
  // Schedule dealing animation if needed
  const timerRef = useRef<NodeJS.Timeout>();
  if (currentState === 'hidden' && !timerRef.current) {
    timerRef.current = setTimeout(() => {
      updateCard(card.word, 'dealing');
      timerRef.current = undefined;
    }, index * 50); // Stagger animations by index
  }
  
  const completeTransition = useCallback(() => {
    if (transition) {
      updateCard(card.word, transition.to);
    }
  }, [transition, card.word, updateCard]);
  
  return {
    state: currentState,
    animation: transition?.animation || null,
    completeTransition
  };
};