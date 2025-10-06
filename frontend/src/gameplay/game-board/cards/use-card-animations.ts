import { useCallback, useRef, useEffect } from 'react';
import { createWebAnimationEngine } from '../../animations/web-animation-engine';
import type { AnimationDefinition } from '../../animations/animation-types';

const cardAnimationEngine = createWebAnimationEngine();

/**
 * Hook for registering card animations with the WebAnimationEngine
 *
 * Provides a stable ref callback factory for attaching animated elements
 * to the engine. Each card can have multiple animated elements (container,
 * cover, overlay) that are registered with their own animation definitions.
 *
 * The engine instance is shared across all cards for centralized animation
 * management and batch operations.
 */
export function useCardAnimations(cardWord: string) {
  const refCallbacks = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map());

  const createAnimationRef = useCallback(
    (elementId: string, animations: Record<string, AnimationDefinition>) => {
      let callback = refCallbacks.current.get(elementId);

      if (!callback) {
        callback = (element: HTMLElement | null) => {
          if (element) {
            cardAnimationEngine.register(cardWord, elementId, element, animations);
          } else {
            cardAnimationEngine.unregister(cardWord, elementId);
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
