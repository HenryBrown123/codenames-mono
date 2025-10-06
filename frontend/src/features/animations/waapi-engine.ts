import type { AnimationDefinition, EntityTransition } from "./types";

/**
 * Generic WAAPI animation engine
 * Manages element registration and animation playback for any entity type
 */
export interface AnimationEngine {
  /**
   * Register an element for animation
   * @param entityId - Unique identifier (e.g., card word, modal ID)
   * @param elementId - Element role (e.g., "container", "badge", "word")
   * @param element - The HTML element to animate
   * @param animations - Animation definitions for this element
   */
  register: (
    entityId: string,
    elementId: string,
    element: HTMLElement,
    animations: Record<string, AnimationDefinition>
  ) => void;

  /**
   * Unregister an element (called when element unmounts)
   * @param entityId - Entity identifier
   * @param elementId - Element role
   */
  unregister: (entityId: string, elementId: string) => void;

  /**
   * Play animations for multiple entities
   * @param transitions - Map of entityId to transition definition
   * @param getIndex - Optional function to determine stagger order
   * @returns Promise that resolves when all animations complete
   */
  playTransitions: (
    transitions: Map<string, EntityTransition>,
    getIndex?: (id: string) => number
  ) => Promise<void>;

  /**
   * Cancel all running animations
   */
  cancelAll: () => void;
}

/**
 * Create a new animation engine instance
 */
export function createAnimationEngine(): AnimationEngine {
  const registry = new Map<
    string,
    Map<string, { element: HTMLElement; animations: Record<string, AnimationDefinition> }>
  >();

  const runningAnimations = new Map<string, Animation>();

  const register = (
    entityId: string,
    elementId: string,
    element: HTMLElement,
    animations: Record<string, AnimationDefinition>
  ) => {
    if (!registry.has(entityId)) {
      registry.set(entityId, new Map());
    }
    registry.get(entityId)!.set(elementId, { element, animations });
  };

  const unregister = (entityId: string, elementId: string) => {
    const entityRegistry = registry.get(entityId);
    if (entityRegistry) {
      entityRegistry.delete(elementId);
      if (entityRegistry.size === 0) {
        registry.delete(entityId);
      }
    }
  };

  const playTransitions = async (
    transitions: Map<string, EntityTransition>,
    getIndex?: (id: string) => number
  ): Promise<void> => {
    const promises: Promise<void>[] = [];

    transitions.forEach((transition, entityId) => {
      const entityElements = registry.get(entityId);

      if (!entityElements) {
        console.warn(`[AnimationEngine] No elements registered for entity: ${entityId}`);
        return;
      }

      const index = getIndex?.(entityId) ?? 0;

      entityElements.forEach(({ element, animations }, elementId) => {
        const animDef = animations[transition.event];
        if (!animDef) {
          console.warn(`[AnimationEngine] No animation for ${transition.event} on ${elementId}`);
          return;
        }

        const animKey = `${entityId}-${elementId}-${transition.event}`;
        const existing = runningAnimations.get(animKey);

        if (existing && existing.playState === "running") {
          return;
        }

        const staggerDelay = index * 50;
        const options = {
          ...animDef.options,
          delay: (animDef.options.delay ?? 0) + staggerDelay,
        };

        const animation = element.animate(animDef.keyframes, options);
        runningAnimations.set(animKey, animation);

        const animationPromise: Promise<void> = animation.finished.then(
          () => {
            runningAnimations.delete(animKey);
          },
          () => {
            runningAnimations.delete(animKey);
          }
        );

        promises.push(animationPromise);
      });
    });

    await Promise.all(promises);
  };

  const cancelAll = () => {
    runningAnimations.forEach((anim) => anim.cancel());
    runningAnimations.clear();
  };

  return { register, unregister, playTransitions, cancelAll };
}
