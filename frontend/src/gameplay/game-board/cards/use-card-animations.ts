/**
 * Hook for registering card animations with the WebAnimationEngine
 *
 * Manages ref callbacks and animation definitions for card elements.
 */

import { useCallback, useRef, useEffect } from 'react';
import { createWebAnimationEngine } from '../../../animations/web-animation-engine';
import type { AnimationDefinition } from '../../../animations/animation-types';

const cardAnimationEngine = createWebAnimationEngine();

/**
 * Hook provides animation registration and triggering for card elements
 *
 * @param cardWord - The card word (used as entity ID)
 * @returns Object with createAnimationRef function and engine instance
 */
export function useCardAnimations(cardWord: string) {
  const refCallbacks = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map());

  /**
   * Create a ref callback that registers an element with the animation engine
   *
   * @param elementId - Unique identifier for this element (e.g., "card-container", "cover-layer")
   * @param animations - Record of animation definitions for this element
   * @returns Stable ref callback function
   */
  const createAnimationRef = useCallback(
    (elementId: string, animations: Record<string, AnimationDefinition>) => {
      let callback = refCallbacks.current.get(elementId);

      if (!callback) {
        callback = (element: HTMLElement | null) => {
          if (element) {
            cardAnimationEngine.register(element, elementId, cardWord, animations);
          } else {
            // Element is being removed - unregister if we have a reference
            const registeredElement = refCallbacks.current.get(`${elementId}-element`) as unknown as HTMLElement;
            if (registeredElement) {
              cardAnimationEngine.unregister(registeredElement);
              refCallbacks.current.delete(`${elementId}-element`);
            }
          }

          // Store element reference for cleanup
          if (element) {
            refCallbacks.current.set(`${elementId}-element`, element as unknown as (el: HTMLElement | null) => void);
          }
        };
        refCallbacks.current.set(elementId, callback);
      }

      return callback;
    },
    [cardWord]
  );

  useEffect(() => {
    return () => {
      refCallbacks.current.clear();
    };
  }, []);

  return {
    createAnimationRef,
    engine: cardAnimationEngine,
  };
}
