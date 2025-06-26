// frontend/src/gameplay/game-board/use-card-animation.ts
import { useCallback, useEffect } from "react";
import { useAnimationState } from "../animation/use-animation-state";
import { cardStateMachine, CardState, CardTrigger } from "./card-animation-states";

export const useCardAnimation = (cardId: string) => {
  const { getState, send } = useAnimationState(cardStateMachine);
  
  const animationState = getState(cardId);
  
  // Debug logging
  useEffect(() => {
    console.log(`[CARD ANIMATION] ${cardId}: state = ${animationState}`);
  }, [animationState, cardId]);
  
  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    // Must check if this is our element, not a child
    if (e.target !== e.currentTarget) {
      console.log(`[CARD ANIMATION] ${cardId}: Ignoring child animation event`);
      return;
    }
    
    console.log(`[CARD ANIMATION] ${cardId}: Animation ended in state ${animationState}, animation name: ${e.animationName}`);
    
    switch (animationState) {
      case 'dealing':
        console.log(`[CARD ANIMATION] ${cardId}: Finishing deal`);
        send(cardId, 'finishDeal');
        break;
      case 'covering':
        console.log(`[CARD ANIMATION] ${cardId}: Finishing cover`);
        send(cardId, 'finishCover');
        break;
    }
  }, [animationState, cardId, send]);
  
  const actions = {
    deal: () => {
      if (animationState === 'hidden') {
        console.log(`[CARD ANIMATION] ${cardId}: Starting deal`);
        send(cardId, 'deal');
        return true;
      }
      console.log(`[CARD ANIMATION] ${cardId}: Cannot deal from state ${animationState}`);
      return false;
    },
    select: () => {
      if (animationState === 'idle') {
        console.log(`[CARD ANIMATION] ${cardId}: Starting select`);
        send(cardId, 'select');
        return true;
      }
      console.log(`[CARD ANIMATION] ${cardId}: Cannot select from state ${animationState}`);
      return false;
    },
    cover: () => {
      if (animationState === 'selecting') {
        console.log(`[CARD ANIMATION] ${cardId}: Starting cover`);
        send(cardId, 'cover');
        return true;
      }
      console.log(`[CARD ANIMATION] ${cardId}: Cannot cover from state ${animationState}`);
      return false;
    },
    reset: () => {
      console.log(`[CARD ANIMATION] ${cardId}: Resetting`);
      send(cardId, 'reset');
    },
  };
  
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