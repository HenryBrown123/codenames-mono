import { useState, useRef, useEffect } from "react";

interface VisualState {
  isFlipped: boolean;
  hasDealt: boolean;
}

/**
 * Derives card visual state from event stream.
 * Events update state → Motion reacts to state changes.
 */
export function useCardVisualState(
  nextEvent: string | null,
  isSelected: boolean
): VisualState {
  const [hasDealt, setHasDealt] = useState(false);
  const lastProcessedEventRef = useRef<string | null>(null);

  // Process events to update visual state
  useEffect(() => {
    if (!nextEvent || nextEvent === lastProcessedEventRef.current) {
      return;
    }

    if (nextEvent === "deal") {
      setHasDealt(true);
    }

    lastProcessedEventRef.current = nextEvent;
  }, [nextEvent]);

  return {
    isFlipped: isSelected, // Derive from props - Motion will animate the transition
    hasDealt,
  };
}
