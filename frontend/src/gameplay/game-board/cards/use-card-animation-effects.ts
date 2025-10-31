import { useState, useRef, useLayoutEffect } from 'react';

type CardDisplayState = 'hidden' | 'visible' | 'visible-colored' | 'covered';
type CardEvent = 'deal' | 'select' | 'reveal-colors' | 'hide-colors';
type ViewMode = 'normal' | 'spymaster' | 'dealing';

interface CardAnimationEffectsOptions {
  viewMode: ViewMode;
  nextEvent: string | null; // Event from server (via useCardEvent hook)
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
 * Manages card animation triggers based on server events.
 * Consumes events from the server event log instead of deriving from props.
 *
 * CRITICAL: displayState is React state (not ref) so that updating it
 * triggers a re-render, which updates entityContext, which syncs to engine.
 */
export function useCardAnimationEffects(options: CardAnimationEffectsOptions) {
  const { viewMode, nextEvent, triggerTransition } = options;
  const [isAnimating, setIsAnimating] = useState(false);
  // Start as visible unless we're in dealing mode
  const [displayState, setDisplayState] = useState<CardDisplayState>(
    viewMode === 'dealing' ? 'hidden' : 'visible'
  );

  // Track the last processed event to prevent reprocessing
  const lastProcessedEventRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!nextEvent || nextEvent === lastProcessedEventRef.current) {
      return;
    }

    const animate = async () => {
      setIsAnimating(true);

      try {
        await triggerTransition(nextEvent);

        const nextState = determineNextCardState(displayState, nextEvent as CardEvent);
        if (nextState) {
          setDisplayState(nextState);
        }

        lastProcessedEventRef.current = nextEvent;
      } finally {
        setIsAnimating(false);
      }
    };

    animate();
  }, [nextEvent, triggerTransition, displayState]);

  return {
    isAnimating,
    displayState,
  };
}
