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
export const useCardVisibility = (card: Card): CardVisibility => {
  const { getCardVisibility } = useCardVisibilityContext();

  const visibilityData = getCardVisibility(card.word) || {
    state: "hidden" as VisualState,
    animation: null,
  };

  const activeElements = useRef<Set<EventTarget>>(new Set());

  const [transitionState, setTransitionState] = useState<{
    animation: AnimationType;
    state: VisualState | null;
    status: "waiting" | "animating" | "complete" | null;
  }>({
    animation: null,
    state: null,
    status: null,
  });

  // Detect animation or state changes
  if (
    visibilityData.animation !== transitionState.animation ||
    visibilityData.state !== transitionState.state
  ) {
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

  const handleAnimationStart = useCallback((e: React.AnimationEvent) => {
    activeElements.current.add(e.currentTarget);
    setTransitionState((prev) => ({ ...prev, status: "animating" }));
  }, []);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    activeElements.current.delete(e.currentTarget);
    if (activeElements.current.size === 0) {
      setTransitionState((prev) => ({ ...prev, status: "complete" }));
    }
  }, []);

  return {
    state: visibilityData.state,
    animation,
    handleAnimationStart,
    handleAnimationEnd,
  };
};
