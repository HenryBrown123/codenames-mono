import { useState, useEffect, useRef } from "react";
import { useAnimation } from "framer-motion";
import type { VisualCardState, CardTransition } from "../../visual-card-state.types";
import { computeVisualCardState, getTransition } from "../../compute-visual-card-state";
import { useCardEvent } from "../../game-data/events";

interface UseCardAnimationEffectsParams {
  card: {
    word: string;
    selected: boolean;
  };
  index: number;
  dealOnEntry: boolean;
}

/**
 * Manages card animation state machine.
 *
 * Flow:
 * 1. Event/prop triggers state computation
 * 2. If state changes, play transition animation
 * 3. After animation completes, commit new state
 *
 * This ensures animations always complete before state updates.
 */
export function useCardAnimationEffectsV2({
  card,
  index,
  dealOnEntry,
}: UseCardAnimationEffectsParams) {
  const nextEvent = useCardEvent(card.word);

  // Visual state machine
  const [visualState, setVisualState] = useState<VisualCardState>(
    dealOnEntry ? "hidden" : "visible",
  );
  const isTransitioning = useRef(false);

  // Motion controls - one per element that animates
  const containerControls = useAnimation();
  const revealControls = useAnimation();

  // Define animations for each transition
  const transitionAnimations: Record<CardTransition, () => Promise<void>> = {
    deal: async () => {
      // Set initial position
      containerControls.set({
        x: -200,
        y: -200,
        rotate: -45,
        scale: 0,
        opacity: 0,
      });

      // Animate to final position
      await containerControls.start({
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        transition: {
          delay: index * 0.05,
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
        },
      });
    },

    select: async () => {
      // Optional - currently skipped
      // If you want a select animation before reveal, implement here
    },

    reveal: async () => {
      // Flip card to show back
      await revealControls.start({
        rotateY: 180,
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      });
    },
  };

  // State machine driver
  useEffect(() => {
    if (isTransitioning.current) {
      return; // Don't interrupt ongoing transitions
    }

    // Compute next state
    const nextState = computeVisualCardState(visualState, nextEvent, card.selected, dealOnEntry);

    // Debug logging
    if (nextState !== visualState) {
      console.log(`Card ${card.word}: ${visualState} → ${nextState}`, {
        event: nextEvent,
        isRevealed: card.selected,
        dealOnEntry,
      });
    }

    // If state should change, play transition
    if (nextState !== visualState) {
      playTransition(nextState);
    }
  }, [nextEvent, card.selected, dealOnEntry, visualState, card.word]);

  const playTransition = async (toState: VisualCardState) => {
    const transition = getTransition(visualState, toState);

    if (!transition) {
      // Direct state jump with no animation (e.g. page refresh)
      console.log(`Card ${card.word}: Direct state jump to ${toState} (no animation)`);
      setVisualState(toState);
      return;
    }

    isTransitioning.current = true;

    try {
      console.log(`Card ${card.word}: Playing transition: ${transition}`);
      // Play animation
      await transitionAnimations[transition]();

      // Commit state AFTER animation completes
      setVisualState(toState);
      console.log(`Card ${card.word}: Committed state: ${toState}`);
    } catch (error) {
      console.error(`Card ${card.word}: Animation error:`, error);
      // Still commit state even if animation fails
      setVisualState(toState);
    } finally {
      isTransitioning.current = false;
    }
  };

  return {
    visualState,
    containerControls,
    revealControls,
  };
}
