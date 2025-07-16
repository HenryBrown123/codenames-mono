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

  // Animation status state - initialized once on first render
  const [animationStatus, setAnimationStatus] = useState<
    "waiting" | "animating" | "complete" | null
  >(visibilityData.animation ? "waiting" : null);

  if (visibilityData.animation && animationStatus === null) {
    setAnimationStatus("waiting");
  }

  console.log(animationStatus);

  // Return animation based on status - persists across dev mode re-renders
  const animation =
    animationStatus === "waiting" || animationStatus === "animating"
      ? visibilityData.animation
      : null;

  console.log("animation", animation);

  /**
   * Track animation start - update status and element tracking
   */
  const handleAnimationStart = useCallback((e: React.AnimationEvent) => {
    activeElements.current.add(e.currentTarget);
    console.log("adding element");
    setAnimationStatus("animating");
  }, []);

  /**
   * Track animation end - clear when all elements finish
   */
  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    activeElements.current.delete(e.currentTarget);
    if (activeElements.current.size === 0) {
      setAnimationStatus("complete");
    }
  }, []);

  return {
    state: visibilityData.state,
    animation,
    handleAnimationStart,
    handleAnimationEnd,
  };
};
