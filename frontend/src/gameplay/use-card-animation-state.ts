import { useState, useRef, useEffect } from "react";

interface CardAnimationState {
  shouldShowCover: boolean;
  shouldFlip: boolean;
  hasDealt: boolean;
  displayState: CardDisplayState;
}

type CardDisplayState = "hidden" | "visible" | "visible-colored" | "covered";
type ViewMode = "normal" | "spymaster" | "dealing";

/**
 * Derives card animation state from event stream.
 * Events update state → Framer Motion reacts to state changes.
 *
 * This replaces imperative animation triggering with declarative state management.
 */
export function useCardAnimationState(
  nextEvent: string | null,
  isSelected: boolean,
  viewMode: ViewMode
): CardAnimationState {
  const [shouldShowCover, setShouldShowCover] = useState(false);
  const [hasDealt, setHasDealt] = useState(viewMode !== "dealing");
  const [displayState, setDisplayState] = useState<CardDisplayState>(
    viewMode === "dealing" ? "hidden" : "visible"
  );
  const lastProcessedEventRef = useRef<string | null>(null);

  useEffect(() => {
    if (!nextEvent || nextEvent === lastProcessedEventRef.current) {
      return;
    }

    if (nextEvent === "deal") {
      setHasDealt(true);
      setDisplayState("visible");
    }

    if (nextEvent === "select") {
      setShouldShowCover(true);
      setDisplayState("covered");
    }

    if (nextEvent === "reveal-colors") {
      setDisplayState("visible-colored");
    }

    if (nextEvent === "hide-colors") {
      setDisplayState("visible");
    }

    lastProcessedEventRef.current = nextEvent;
  }, [nextEvent]);

  // If card is selected (revealed), cover should not be visible
  useEffect(() => {
    if (isSelected) {
      setShouldShowCover(false);
    }
  }, [isSelected]);

  return {
    shouldShowCover,
    shouldFlip: isSelected,
    hasDealt,
    displayState,
  };
}
