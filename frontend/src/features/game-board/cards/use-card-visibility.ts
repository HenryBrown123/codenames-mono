import { useCallback, useEffect, useRef } from "react";
import { useCardVisibilityStore } from "./card-visibility-store";
import { cardAnimationEngine } from "./card-animations";
import type { AnimationDefinition } from "../../animations/types";
import type { CardDisplayState, ViewMode } from "./card-visibility-store";

/**
 * Hook return interface
 * Provides everything a card component needs for visibility and animations
 */
interface UseCardVisibilityReturn {
  /**
   * Current visual state of the card
   */
  displayState: CardDisplayState;

  /**
   * Whether the card is currently animating
   * Used to block user interactions during animations
   */
  isPending: boolean;

  /**
   * Current view mode (player or spymaster)
   */
  viewMode: ViewMode;

  /**
   * Creates a stable ref callback for animation element registration
   * @param elementId - Role of this element (e.g., "container", "word", "badge")
   * @param animations - Animation definitions for this element
   * @returns Ref callback to attach to element
   */
  createAnimationRef: (
    elementId: string,
    animations: Record<string, AnimationDefinition>
  ) => (element: HTMLElement | null) => void;
}

/**
 * Card visibility hook
 * Manages animation state and element registration for a single card
 *
 * @param cardWord - Unique card identifier (the word on the card)
 * @param index - Card position in grid (used for stagger calculations in store)
 */
export function useCardVisibility(cardWord: string, index: number): UseCardVisibilityReturn {
  const cardState = useCardVisibilityStore(
    useCallback((state) => state.cards.get(cardWord), [cardWord])
  );

  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const initializeCard = useCardVisibilityStore((state) => state.initializeCard);

  const animationRefCallbacks = useRef<Map<string, (element: HTMLElement | null) => void>>(
    new Map()
  );

  useEffect(() => {
    if (!cardState) {
      initializeCard(cardWord);
    }
  }, [cardWord, cardState, initializeCard]);

  const createAnimationRef = useCallback(
    (elementId: string, animations: Record<string, AnimationDefinition>) => {
      let ref = animationRefCallbacks.current.get(elementId);
      if (ref) return ref;

      ref = (element: HTMLElement | null) => {
        if (element) {
          cardAnimationEngine.register(cardWord, elementId, element, animations);
        } else {
          cardAnimationEngine.unregister(cardWord, elementId);
        }
      };

      animationRefCallbacks.current.set(elementId, ref);
      return ref;
    },
    [cardWord]
  );

  useEffect(() => {
    return () => {
      animationRefCallbacks.current.clear();
    };
  }, []);

  return {
    displayState: cardState?.displayState || "hidden",
    isPending: cardState?.isTransitioning || false,
    viewMode,
    createAnimationRef,
  };
}
