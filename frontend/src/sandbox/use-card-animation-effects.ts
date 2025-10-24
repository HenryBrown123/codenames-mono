import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import type { ViewMode } from '../gameplay/game-board/view-mode';

type CardDisplayState = 'hidden' | 'visible' | 'visible-colored' | 'covered';
type CardEvent = 'deal' | 'select' | 'reveal-colors' | 'hide-colors';

interface Card {
  word: string;
  teamName: string;
  selected: boolean;
}

/**
 * State machine: defines valid transitions
 */
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
    covered: {
      // Terminal state
    },
  };

  return transitions[current]?.[event] ?? null;
}

/**
 * Manages card animation triggers based on prop changes.
 * Tracks visual state and derives animation events declaratively.
 */
export function useCardAnimationEffects(
  card: Card,
  viewMode: ViewMode,
  triggerTransition: (event: string) => Promise<void>
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);

  // Track committed visual state (what we've animated to)
  const displayStateRef = useRef<CardDisplayState>('hidden');
  const prevViewMode = useRef<ViewMode | undefined>(undefined);
  const prevSelected = useRef(card.selected);

  // Derive next animation event from prop changes
  const nextEvent = useMemo((): CardEvent | null => {
    const displayState = displayStateRef.current;

    // ViewMode toggle
    if (prevViewMode.current !== viewMode && prevViewMode.current !== undefined) {
      if (viewMode === 'spymaster' && displayState === 'visible') {
        return 'reveal-colors';
      }
      if (viewMode === 'normal' && displayState === 'visible-colored') {
        return 'hide-colors';
      }
    }

    // Card selection (false → true)
    if (!prevSelected.current && card.selected && displayState !== 'covered') {
      return 'select';
    }

    return null;
  }, [viewMode, card.selected]);

  // Execute animation when event derived
  useLayoutEffect(() => {
    if (!nextEvent) return;

    const animate = async () => {
      setIsAnimating(true);
      setCurrentAnimation(nextEvent);

      try {
        await triggerTransition(nextEvent);

        // Update displayState via state machine
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

    // Update refs for next comparison
    prevViewMode.current = viewMode;
    prevSelected.current = card.selected;
  }, [nextEvent, triggerTransition, viewMode, card.selected]);

  return {
    isAnimating,
    currentAnimation,
  };
}
