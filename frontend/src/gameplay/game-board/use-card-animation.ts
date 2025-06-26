import { useCallback, useRef } from "react";
import { useAnimationState } from "../animation/use-animation-state";
import { cardStateMachine } from "./card-animation-states";

/**
 * Card-specific animation hook that provides a clean API for managing card animations.
 * Uses ref-based state tracking to avoid useEffect and ensure clean transitions.
 * 
 * @param cardId - Unique identifier for the card
 * @returns Object with current state, state checks, actions, and animation handler
 */
export const useCardAnimation = (cardId: string) => {
  const { getState, send } = useAnimationState(cardStateMachine);
  const animationState = getState(cardId);
  const hasDealtRef = useRef(false);
  
  // Deal trigger during render - but guarded by ref
  if (animationState === 'hidden' && !hasDealtRef.current) {
    console.log(`[CARD ANIMATION] ${cardId}: Auto-dealing from state: ${animationState}`);
    const newState = send(cardId, 'deal');
    console.log(`[CARD ANIMATION] ${cardId}: After deal trigger, state is: ${newState}`);
    hasDealtRef.current = true;
  }
  
  // Handle CSS animation completion events
  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    
    // Check the actual animation name from CSS
    const animationName = e.animationName;
    console.log(`[CARD ANIMATION] ${cardId}: Animation '${animationName}' ended in state ${animationState}`);
    
    // Match animation names to state transitions
    // styled-components generates unique names, so we need to check for the base names
    if (animationName.includes('dealAnimation') && animationState === 'dealing') {
      send(cardId, 'finishDeal');
    } else if (animationName.includes('flipAnimation') && animationState === 'covering') {
      send(cardId, 'finishCover');
    }
  }, [animationState, cardId, send]);
  
  // Semantic actions that check current state before transitioning
  const actions = {
    select: () => animationState === 'idle' && send(cardId, 'select'),
    cover: () => animationState === 'selecting' && send(cardId, 'cover'),
    reset: () => {
      hasDealtRef.current = false;
      send(cardId, 'reset');
    },
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