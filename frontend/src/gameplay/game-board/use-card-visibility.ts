import { useState, useCallback } from 'react';
import { Card } from '@frontend/shared-types';

interface CardVisibilityConfig {
  cards: Card[];
  showOnMount?: boolean;
}

/**
 * Hook that tracks the visual presentation state of cards on the game board.
 * Manages which cards have been dealt (made visible) and which have been covered.
 * This state is used to determine when animations should play.
 */
export const useCardVisibility = ({ cards, showOnMount = false }: CardVisibilityConfig) => {
  // Track which cards have been dealt (are visible on the board)
  const [dealtCards, setDealtCards] = useState<Set<string>>(() => {
    if (showOnMount) {
      // Start with empty set - all cards will animate in
      return new Set();
    }
    // Mark all cards as already dealt - skip animations
    return new Set(cards.map((card, i) => `${i}-${card.word}`));
  });
  
  // Track which cards have been covered (flipped to show team color)
  const [coveredCards, setCoveredCards] = useState<Set<string>>(() => {
    const covered = new Set<string>();
    cards.forEach((card, i) => {
      if (card.selected) {
        covered.add(`${i}-${card.word}`);
      }
    });
    return covered;
  });

  // Track which cards have had their colors revealed (for codemaster)
  const [colorFadedCards, setColorFadedCards] = useState<Set<string>>(() => {
    const faded = new Set<string>();
    if (!showOnMount) {
      cards.forEach((card, i) => {
        faded.add(`${i}-${card.word}`);
      });
    }
    return faded;
  });
  
  // Check visibility states
  const hasBeenDealt = useCallback((cardId: string) => dealtCards.has(cardId), [dealtCards]);
  const hasBeenCovered = useCallback((cardId: string) => coveredCards.has(cardId), [coveredCards]);
  const hasBeenColorFaded = useCallback((cardId: string) => colorFadedCards.has(cardId), [colorFadedCards]);
  
  // Mark cards as having completed their animations
  const markAsDealt = useCallback((cardId: string) => {
    setDealtCards(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);
  
  const markAsCovered = useCallback((cardId: string) => {
    setCoveredCards(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  const markAsColorFaded = useCallback((cardId: string) => {
    setColorFadedCards(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);
  
  // Reset visibility for re-dealing
  const resetVisibility = useCallback(() => {
    setDealtCards(new Set());
    setCoveredCards(new Set());
    setColorFadedCards(new Set());
  }, []);
  
  // Skip animations for specific cards
  const skipAnimations = useCallback((cardIds: string[]) => {
    setDealtCards(prev => {
      const next = new Set(prev);
      cardIds.forEach(id => next.add(id));
      return next;
    });
  }, []);
  
  // Derive what animation should play for a card
  const getRequiredAnimation = useCallback((cardId: string, card: Card): 'dealing' | 'covering' | null => {
    if (!hasBeenDealt(cardId)) {
      return 'dealing';
    }
    if (card.selected && !hasBeenCovered(cardId)) {
      return 'covering';
    }
    return null;
  }, [hasBeenDealt, hasBeenCovered]);

  // Derive what animation should play for a card on codemaster board (includes color fade)
  const getRequiredCodemasterAnimation = useCallback((cardId: string, card: Card): 'dealing' | 'color-fade' | 'covering' | null => {
    if (!hasBeenDealt(cardId)) {
      return 'dealing';
    }
    if (hasBeenDealt(cardId) && !hasBeenColorFaded(cardId)) {
      return 'color-fade';
    }
    if (card.selected && !hasBeenCovered(cardId)) {
      return 'covering';
    }
    return null;
  }, [hasBeenDealt, hasBeenColorFaded, hasBeenCovered]);
  
  // Handle animation completion
  const handleAnimationComplete = useCallback((cardId: string, animation: string | null) => {
    if (animation === 'dealing') {
      markAsDealt(cardId);
    } else if (animation === 'color-fade') {
      markAsColorFaded(cardId);
    } else if (animation === 'covering') {
      markAsCovered(cardId);
    }
  }, [markAsDealt, markAsColorFaded, markAsCovered]);
  
  return {
    hasBeenDealt,
    hasBeenCovered,
    hasBeenColorFaded,
    markAsDealt,
    markAsCovered,
    markAsColorFaded,
    resetVisibility,
    skipAnimations,
    getRequiredAnimation,
    getRequiredCodemasterAnimation,
    handleAnimationComplete,
  };
};