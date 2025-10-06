import { createWebAnimationEngine } from '../../animations/web-animation-engine';
import { useAnimationRegistration } from '../../animations/use-animation-registration';

export const boardAnimationEngine = createWebAnimationEngine();

/**
 * Card-specific animation hook
 *
 * Wraps the generic useAnimationRegistration with the shared board animation engine.
 */
export function useCardAnimations(cardWord: string) {
  return useAnimationRegistration(cardWord, boardAnimationEngine);
}
