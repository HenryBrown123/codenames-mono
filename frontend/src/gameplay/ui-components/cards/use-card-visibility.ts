import { useCallback, useState, useRef } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityContext } from "./card-visibility-provider";
import type { VisualState, AnimationType } from "./card-visibility-provider";

export interface CardVisibility {
  state: VisualState;
  animation: AnimationType;
  handleAnimationStart: (e: React.AnimationEvent) => void;
  handleAnimationEnd: (e: React.AnimationEvent) => void;
}

/**
 * Hook manages animation status lifecycle to handle React dev mode double-rendering
 * Status persists animation attributes across renders until CSS animations complete
 */
export const useCardVisibility = (card: Card, _index: number): CardVisibility => {
  const { getCardVisibility } = useCardVisibilityContext();

  const visibilityData = getCardVisibility(card.word) || {
    state: "hidden" as VisualState,
    animation: null,
  };

  const activeElements = useRef<Set<EventTarget>>(new Set());

  // Transition state compomnent lvl cache
  const [transitionState, setTransitionState] = useState<{
    animation: AnimationType;
    state: VisualState | null;
    status: "waiting" | "animating" | "complete" | null;
  }>({
    animation: null,
    state: null,
    status: null,
  });

  // Detect either animation changes or state change
  if (
    visibilityData.animation !== transitionState.animation ||
    visibilityData.state !== transitionState.state
  ) {
    if (_index === 0) {
      console.log(`[useCardVisibility:${card.word}] Animation change detected:`, {
        old: transitionState.animation,
        new: visibilityData.animation,
        oldStatus: transitionState.status,
      });
    }
    setTransitionState({
      animation: visibilityData.animation,
      state: visibilityData.state,
      status: visibilityData.animation ? "waiting" : null,
    });
  }

  // Return animation based on status
  const animation =
    transitionState.status === "waiting" || transitionState.status === "animating"
      ? transitionState.animation
      : null;

  if (_index === 0) {
    console.log(`[useCardVisibility:${card.word}] Hook return:`, {
      state: visibilityData.state,
      providerAnimation: visibilityData.animation,
      animationState: transitionState,
      returnedAnimation: animation,
      activeElementsCount: activeElements.current.size,
    });
  }

  const handleAnimationStart = useCallback(
    (e: React.AnimationEvent) => {
      activeElements.current.add(e.currentTarget);
      if (_index === 0) {
        console.log(`[useCardVisibility:${card.word}] Animation START:`, {
          animationName: e.animationName,
          target: e.currentTarget,
          activeCount: activeElements.current.size,
          currentStatus: transitionState.status,
        });
      }
      setTransitionState((prev) => ({ ...prev, status: "animating" }));
    },
    [card.word, transitionState.status, _index],
  );

  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent) => {
      activeElements.current.delete(e.currentTarget);
      if (_index === 0) {
        console.log(`[useCardVisibility:${card.word}] Animation END:`, {
          animationName: e.animationName,
          target: e.currentTarget,
          remainingCount: activeElements.current.size,
          currentStatus: transitionState.status,
        });
      }
      if (activeElements.current.size === 0) {
        if (_index === 0) {
          console.log(
            `[useCardVisibility:${card.word}] All animations complete, setting status to 'complete'`,
          );
        }
        setTransitionState((prev) => ({ ...prev, status: "complete" }));
      }
    },
    [card.word, transitionState.status, _index],
  );

  return {
    state: visibilityData.state,
    animation,
    handleAnimationStart,
    handleAnimationEnd,
  };
};
