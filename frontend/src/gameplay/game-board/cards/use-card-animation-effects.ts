import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { Card } from '@frontend/shared-types';

type CardDisplayState = 'hidden' | 'visible' | 'visible-colored' | 'covered';
type CardEvent = 'deal' | 'select' | 'reveal-colors' | 'hide-colors';
type ViewMode = 'normal' | 'spymaster' | 'dealing';

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
 * CRITICAL: displayState is React state (not ref) so that updating it
 * triggers a re-render, which updates entityContext, which syncs to engine.
 */
export function useCardAnimationEffects(
  card: Card,
  options: CardAnimationEffectsOptions
) {
  const { viewMode, triggerTransition } = options;
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayState, setDisplayState] = useState<CardDisplayState>('hidden');

  const prevViewMode = useRef<ViewMode | undefined>(undefined);
  const prevSelected = useRef(card.selected);

  const nextEvent = useMemo((): CardEvent | null => {
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
  }, [viewMode, card.selected, displayState]);

  useLayoutEffect(() => {
    if (!nextEvent) return;

    const animate = async () => {
      setIsAnimating(true);

      try {
        await triggerTransition(nextEvent);

        const nextState = determineNextCardState(displayState, nextEvent);
        if (nextState) {
          setDisplayState(nextState);
        }
      } finally {
        setIsAnimating(false);
      }
    };

    animate();

    prevViewMode.current = viewMode;
    prevSelected.current = card.selected;
  }, [nextEvent, triggerTransition, displayState, viewMode, card.selected]);

  return {
    isAnimating,
    displayState,
  };
}
