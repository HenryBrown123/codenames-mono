// ===== FIX: Ensure cards render hidden before dealing =====

// ===== use-board-animations.ts =====
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
  const processedCards = useRef(new Set<string>());
  const coveringCards = useRef(new Set<string>());
  const serverSelectedCards = useRef(new Set<string>()); // Track processed server selections
  
  const getCardAnimation = useCallback((cardId: string): CardAnimationControl => {
    const state = animationState.getState(cardId);
    
    // Auto-deal NEW cards after they've been painted
    if (!processedCards.current.has(cardId) && state === 'hidden') {
      processedCards.current.add(cardId);
      // Single RAF ensures card is rendered in hidden state before dealing
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
          console.warn(`[BOARD ANIMATIONS] Cannot select ${cardId} - state is ${state}, not idle`);
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
          processedCards.current.delete(cardId);
          coveringCards.current.delete(cardId);
          serverSelectedCards.current.delete(cardId);
          animationState.reset(cardId);
        },
      },
    };
  }, [animationState]);
  
  const handleAnimationEnd = useCallback((cardId: string, e: React.AnimationEvent) => {
    // Detailed logging
    console.log(`[BOARD ANIMATIONS] onAnimationEnd fired for ${cardId}:`, {
      animationName: e.animationName,
      target: e.target === e.currentTarget ? 'correct' : 'child element'
    });
    
    if (e.target !== e.currentTarget) return;
    
    const state = animationState.getState(cardId);
    console.log(`[BOARD ANIMATIONS] Processing animation end for ${cardId} in state: ${state}`);
    
    // No RAF here - state updates should be synchronous
    switch (state) {
      case 'dealing':
        console.log(`[BOARD ANIMATIONS] Transitioning ${cardId} from dealing to idle`);
        animationState.send(cardId, 'finishDeal');
        break;
      case 'covering':
        console.log(`[BOARD ANIMATIONS] Transitioning ${cardId} from covering to covered`);
        animationState.send(cardId, 'finishCover');
        coveringCards.current.delete(cardId);
        break;
    }
  }, [animationState]);
  
  const handleServerSelection = useCallback((cardId: string, isSelected: boolean) => {
    const state = animationState.getState(cardId);
    
    // Skip if we've already processed this server selection
    if (isSelected && serverSelectedCards.current.has(cardId)) {
      return;
    }
    
    if (isSelected && state === 'selecting' && !coveringCards.current.has(cardId)) {
      requestAnimationFrame(() => {
        console.log(`[BOARD ANIMATIONS] Server confirmed selection for: ${cardId}`);
        coveringCards.current.add(cardId);
        serverSelectedCards.current.add(cardId); // Mark as processed
        animationState.send(cardId, 'cover');
      });
    }
    
    // If a card is not selected but was previously, remove from tracking
    if (!isSelected && serverSelectedCards.current.has(cardId)) {
      serverSelectedCards.current.delete(cardId);
    }
  }, [animationState]);
  
  // Add method to reset all cards (for deal button)
  const resetAllCards = useCallback(() => {
    console.log('[BOARD ANIMATIONS] Resetting all cards for re-deal');
    processedCards.current.clear();
    coveringCards.current.clear();
    serverSelectedCards.current.clear(); // Clear server selection tracking
    animationState.reset();
  }, [animationState]);
  
  // Add method to get current state summary
  const getStateSummary = useCallback(() => {
    const summary: Record<CardState, number> = {
      hidden: 0,
      dealing: 0,
      idle: 0,
      selecting: 0,
      covering: 0,
      covered: 0,
    };
    
    Array.from(processedCards.current).forEach(cardId => {
      const state = animationState.getState(cardId);
      summary[state]++;
    });
    
    return summary;
  }, [animationState]);
  
  return {
    getCardAnimation,
    handleAnimationEnd,
    handleServerSelection,
    resetAllCards,
    getStateSummary,
  };
};