import { useCallback } from "react";
import { useAnimationState } from "../animation/use-animation-state";
import { cardStateMachine } from "./card-animation-states";

/**
 * Card-specific animation hook that provides a clean API for managing card animations.
 * Handles animation completion events and provides semantic actions.
 * 
 * @param cardId - Unique identifier for the card (typically the word)
 * @returns Object with current state, state checks, actions, and animation handler
 */
export const useCardAnimation = (cardId: string) => {
  const { getState, send } = useAnimationState(cardStateMachine);
  
  const animationState = getState(cardId);
  
  // Handle CSS animation completion events
  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    
    switch (animationState) {
      case 'dealing':
        send(cardId, 'finishDeal');
        break;
      case 'covering':
        send(cardId, 'finishCover');
        break;
    }
  }, [animationState, cardId, send]);
  
  // Semantic actions that check current state before transitioning
  const actions = {
    deal: () => animationState === 'hidden' && send(cardId, 'deal'),
    finishDeal: () => animationState === 'dealing' && send(cardId, 'finishDeal'),
    select: () => animationState === 'idle' && send(cardId, 'select'),
    cover: () => animationState === 'selecting' && send(cardId, 'cover'),
    finishCover: () => animationState === 'covering' && send(cardId, 'finishCover'),
    reset: () => send(cardId, 'reset'),
  };
  
  // Convenient state checks
  const is = {
    hidden: animationState === 'hidden',
    dealing: animationState === 'dealing',
    idle: animationState === 'idle',
    selecting: animationState === 'selecting',
    covering: animationState === 'covering',
    covered: animationState === 'covered',
  };
  
  return {
    state: animationState,
    is,
    actions,
    handleAnimationEnd,
  };
};