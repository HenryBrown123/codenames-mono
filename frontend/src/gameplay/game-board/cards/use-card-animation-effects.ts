import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { Card } from '@frontend/shared-types';

type CardDisplayState = 'hidden' | 'visible' | 'visible-colored' | 'covered';
type CardEvent = 'deal' | 'select' | 'reveal-colors' | 'hide-colors';
type ViewMode = 'normal' | 'spymaster';

interface CardAnimationEffectsOptions {
  viewMode: ViewMode;
  triggerTransition: (event: string) => Promise<void>;
}

function determineNextCardState(
  current: CardDisplayState,
  event: CardEvent
): CardDisplayState | null {
  const transitions: Record<
    CardDisplayState,
    Partial<Record<CardEvent, CardDisplayState>>
  > = {
    hidden: {
      deal: 'visible',
    },
    visible: {
      select: 'covered',
      'reveal-colors': 'visible-colored',
    },
    'visible-colored': {
      select: 'covered',
      'hide-colors': 'visible',
    },
    covered: {},
  };

  return transitions[current]?.[event] ?? null;
}

/**
 * Manages card animation triggers based on prop changes.
 * Tracks visual state and derives animation events declaratively.
 *
 * This hook is the state machine - it compares previous props to current props
 * and determines what animation event (if any) should be triggered.
 */
export function useCardAnimationEffects(
  card: Card,
  options: CardAnimationEffectsOptions
) {
  const { viewMode, triggerTransition } = options;
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);

  const displayStateRef = useRef<CardDisplayState>('hidden');
  const prevViewMode = useRef<ViewMode | undefined>(undefined);
  const prevSelected = useRef(card.selected);

  const nextEvent = useMemo((): CardEvent | null => {
    const displayState = displayStateRef.current;

    if (prevViewMode.current !== viewMode && prevViewMode.current !== undefined) {
      if (viewMode === 'spymaster' && displayState === 'visible') {
        return 'reveal-colors';
      }
      if (viewMode === 'normal' && displayState === 'visible-colored') {
        return 'hide-colors';
      }
    }

    if (!prevSelected.current && card.selected && displayState !== 'covered') {
      return 'select';
    }

    return null;
  }, [viewMode, card.selected]);

  useLayoutEffect(() => {
    if (!nextEvent) return;

    const animate = async () => {
      setIsAnimating(true);
      setCurrentAnimation(nextEvent);

      try {
        await triggerTransition(nextEvent);

        const nextState = determineNextCardState(displayStateRef.current, nextEvent);
        if (nextState) {
          displayStateRef.current = nextState;
        }
      } finally {
        setIsAnimating(false);
        setCurrentAnimation(null);
      }
    };

    animate();

    prevViewMode.current = viewMode;
    prevSelected.current = card.selected;
  }, [nextEvent, triggerTransition, viewMode, card.selected]);

  return {
    isAnimating,
    currentAnimation,
    displayState: displayStateRef.current,
  };
}
