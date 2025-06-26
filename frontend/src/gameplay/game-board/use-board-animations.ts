import { useCallback, useRef } from "react";
import { useAnimationState } from "../animation/use-animation-state";
import { cardStateMachine, CardState } from "./card-animation-states";

export interface CardAnimationControl {
  state: CardState;
  is: {
    hidden: boolean;
    dealing: boolean;
    idle: boolean;
    selecting: boolean;
    covering: boolean;
    covered: boolean;
  };
  actions: {
    select: () => boolean;
    cover: () => boolean;
    reset: () => void;
  };
}

export const useBoardAnimations = () => {
  const animationState = useAnimationState(cardStateMachine);
  const initializedCards = useRef(new Set<string>());
  const coveringCards = useRef(new Set<string>());
  
  const getCardAnimation = useCallback((cardId: string): CardAnimationControl => {
    const state = animationState.getState(cardId);
    
    // Auto-trigger deal for new cards using RAF
    if (!initializedCards.current.has(cardId) && state === 'hidden') {
      initializedCards.current.add(cardId);
      
      requestAnimationFrame(() => {
        console.log(`[BOARD ANIMATIONS] Auto-dealing card: ${cardId}`);
        animationState.send(cardId, 'deal');
      });
    }
    
    return {
      state,
      is: {
        hidden: state === 'hidden',
        dealing: state === 'dealing',
        idle: state === 'idle',
        selecting: state === 'selecting',
        covering: state === 'covering',
        covered: state === 'covered',
      },
      actions: {
        select: () => {
          if (state === 'idle') {
            console.log(`[BOARD ANIMATIONS] Selecting card: ${cardId}`);
            animationState.send(cardId, 'select');
            return true;
          }
          return false;
        },
        cover: () => {
          if (state === 'selecting' && !coveringCards.current.has(cardId)) {
            console.log(`[BOARD ANIMATIONS] Covering card: ${cardId}`);
            coveringCards.current.add(cardId);
            animationState.send(cardId, 'cover');
            return true;
          }
          return false;
        },
        reset: () => {
          console.log(`[BOARD ANIMATIONS] Resetting card: ${cardId}`);
          initializedCards.current.delete(cardId);
          coveringCards.current.delete(cardId);
          animationState.send(cardId, 'reset');
        },
      },
    };
  }, [animationState]);
  
  const handleAnimationEnd = useCallback((cardId: string, e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    
    const state = animationState.getState(cardId);
    console.log(`[BOARD ANIMATIONS] Animation ended for ${cardId} in state: ${state}`);
    
    requestAnimationFrame(() => {
      switch (state) {
        case 'dealing':
          animationState.send(cardId, 'finishDeal');
          break;
        case 'covering':
          animationState.send(cardId, 'finishCover');
          coveringCards.current.delete(cardId);
          break;
      }
    });
  }, [animationState]);
  
  const handleServerSelection = useCallback((cardId: string, isSelected: boolean) => {
    const state = animationState.getState(cardId);
    
    if (isSelected && state === 'selecting' && !coveringCards.current.has(cardId)) {
      requestAnimationFrame(() => {
        console.log(`[BOARD ANIMATIONS] Server confirmed selection for: ${cardId}`);
        coveringCards.current.add(cardId);
        animationState.send(cardId, 'cover');
      });
    }
  }, [animationState]);
  
  return {
    getCardAnimation,
    handleAnimationEnd,
    handleServerSelection,
  };
};