import { useState, useCallback } from 'react';
import { Card } from '@frontend/shared-types';

/**
 * All possible animations for card transitions
 */
type AnimationType = 'dealing' | 'codemaster-reveal' | 'covering';

/**
 * Codebreaker card states - mutually exclusive
 */
type CodebreakerCardState = 'hidden' | 'visible' | 'covered';

/**
 * Codemaster card states - mutually exclusive  
 */
type CodemasterCardState = 'hidden' | 'visible-grey' | 'visible-colored' | 'covered';

/**
 * Union type for all card states
 */
export type CardState = CodebreakerCardState | CodemasterCardState;

/**
 * Card visibility info returned by the hook
 */
export interface CardVisibility {
  state: CardState;
  animation: AnimationType | null;
}

/**
 * State transition definition
 */
interface StateTransition<TState> {
  from: TState;
  to: TState;
  animation: AnimationType;
  condition?: (card: Card) => boolean;
}

/**
 * Codebreaker state transitions
 */
const CODEBREAKER_TRANSITIONS: StateTransition<CodebreakerCardState>[] = [
  {
    from: 'hidden',
    to: 'visible',
    animation: 'dealing'
  },
  {
    from: 'visible',
    to: 'covered',
    animation: 'covering',
    condition: (card) => card.selected
  }
];

/**
 * Codemaster state transitions
 */
const CODEMASTER_TRANSITIONS: StateTransition<CodemasterCardState>[] = [
  {
    from: 'hidden',
    to: 'visible-grey',
    animation: 'dealing'
  },
  {
    from: 'visible-grey',
    to: 'visible-colored',
    animation: 'codemaster-reveal'
  },
  {
    from: 'visible-colored',
    to: 'covered',
    animation: 'covering',
    condition: (card) => card.selected
  }
];

/**
 * Props for the hook
 */
interface UseCardVisibilityProps {
  cards: Card[];
  role: 'codebreaker' | 'codemaster' | 'spectator';
}

/**
 * Hook return type
 */
interface UseCardVisibilityReturn {
  getCardVisibility: (index: number, card: Card) => CardVisibility;
  completeAnimation: (index: number, animation: AnimationType) => void;
  resetVisibility: () => void;
}

/**
 * Manages card visibility states and animations
 */
export function useCardVisibility({ 
  cards, 
  role
}: UseCardVisibilityProps): UseCardVisibilityReturn {
  type RoleCardState = typeof role extends 'codemaster' ? CodemasterCardState : CodebreakerCardState;
  
  // Initialize states - always start hidden to trigger deal animation on mount
  const [cardStates, setCardStates] = useState<RoleCardState[]>(() => 
    cards.map(card => {
      // If card is already selected, it should appear covered
      if (card.selected) return 'covered' as RoleCardState;
      // Otherwise start hidden so deal animation plays
      return 'hidden' as RoleCardState;
    })
  );
  
  // Select transitions based on role
  const transitions = role === 'codemaster' 
    ? CODEMASTER_TRANSITIONS 
    : CODEBREAKER_TRANSITIONS;
  
  /**
   * Get current visibility for a card
   */
  const getCardVisibility = useCallback((index: number, card: Card): CardVisibility => {
    const state = cardStates[index];
    if (!state) {
      return {
        state: 'hidden' as CardState,
        animation: null
      };
    }
    
    // Find applicable transition from current state
    const transition = transitions.find(t => 
      t.from === state && (!t.condition || t.condition(card))
    );
    
    return {
      state: state as CardState,
      animation: transition?.animation || null
    };
  }, [cardStates, transitions]);
  
  /**
   * Complete an animation by advancing to the next state
   */
  const completeAnimation = useCallback((index: number, animation: AnimationType) => {
    setCardStates(prev => {
      const currentState = prev[index];
      if (!currentState) return prev;
      
      // Find the transition that matches this animation from current state
      const transition = transitions.find(t => 
        t.from === currentState && t.animation === animation
      );
      
      if (!transition) {
        console.warn(`No transition found for animation '${animation}' from state '${currentState}'`);
        return prev;
      }
      
      const next = [...prev];
      next[index] = transition.to as RoleCardState;
      return next;
    });
  }, [transitions]);
  
  /**
   * Reset all cards to hidden state
   */
  const resetVisibility = useCallback(() => {
    setCardStates(cards.map(() => 'hidden' as RoleCardState));
  }, [cards]);
  
  return {
    getCardVisibility,
    completeAnimation,
    resetVisibility,
  };
}