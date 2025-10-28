import { useState, useRef, useLayoutEffect } from "react";

type CardDisplayState = "hidden" | "visible" | "visible-colored" | "covered";
type CardEvent = "deal" | "select" | "reveal_colors" | "hide_colors";

/**
 * State machine: defines valid transitions
 */
function determineNextCardState(
  current: CardDisplayState,
  event: CardEvent,
): CardDisplayState | null {
  const transitions: Record<CardDisplayState, Partial<Record<CardEvent, CardDisplayState>>> = {
    hidden: {
      deal: "visible",
    },
    visible: {
      select: "covered",
      reveal_colors: "visible-colored",
    },
    "visible-colored": {
      select: "covered",
      hide_colors: "visible",
    },
    covered: {
      // Terminal state
    },
  };

  return transitions[current]?.[event] ?? null;
}

/**
 * Manages card animation triggers based on server events.
 * Consumes events from event log instead of deriving from props.
 */
export function useCardAnimationEffects(
  nextEvent: string | null,
  triggerTransition: (event: string) => Promise<void>,
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);

  // Track committed visual state (what we've animated to)
  const displayStateRef = useRef<CardDisplayState>("hidden");

  // Track the last processed event to prevent reprocessing
  const lastProcessedEventRef = useRef<string | null>(null);

  // Execute animation when event received
  useLayoutEffect(() => {
    // Skip if no event or already processed
    if (!nextEvent || nextEvent === lastProcessedEventRef.current) {
      return;
    }

    console.log(`[useLayoutEffect] Event: ${nextEvent}, displayState: ${displayStateRef.current}`);

    // Check if this event requires certain elements
    const requiredElements =
      nextEvent === "reveal_colors" || nextEvent === "hide_colors"
        ? ["container", "overlay"]
        : ["container"];

    console.log(`[useLayoutEffect] Required elements:`, requiredElements);

    const animate = async () => {
      setIsAnimating(true);
      setCurrentAnimation(nextEvent);

      try {
        console.log(`[useLayoutEffect] About to call triggerTransition(${nextEvent})`);
        await triggerTransition(nextEvent);
        console.log(`[useLayoutEffect] triggerTransition completed`);

        // Update displayState via state machine
        const nextState = determineNextCardState(displayStateRef.current, nextEvent as CardEvent);
        if (nextState) {
          displayStateRef.current = nextState;
        }

        // Mark event as processed
        lastProcessedEventRef.current = nextEvent;

        console.log(`[useLayoutEffect] Final state: ${displayStateRef.current}`);
      } catch (error) {
        console.error(`[useLayoutEffect] Animation failed:`, error);
      } finally {
        setIsAnimating(false);
        setCurrentAnimation(null);
      }
    };

    animate();
  }, [nextEvent, triggerTransition]);

  return {
    isAnimating,
    currentAnimation,
  };
}
