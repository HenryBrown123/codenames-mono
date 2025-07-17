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

  // Track both animation and status together
  const [animationState, setAnimationState] = useState<{
    animation: AnimationType;
    status: "waiting" | "animating" | "complete" | null;
  }>({
    animation: null,
    status: null,
  });

  // Detect animation changes from provider
  if (visibilityData.animation !== animationState.animation) {
    if (_index === 0) {
      console.log(`[useCardVisibility:${card.word}] Animation change detected:`, {
        old: animationState.animation,
        new: visibilityData.animation,
        oldStatus: animationState.status
      });
    }
    setAnimationState({
      animation: visibilityData.animation,
      status: visibilityData.animation ? "waiting" : null,
    });
  }

  // Return animation based on status
  const animation =
    animationState.status === "waiting" || animationState.status === "animating"
      ? animationState.animation
      : null;

  if (_index === 0) {
    console.log(`[useCardVisibility:${card.word}] Hook return:`, {
      state: visibilityData.state,
      providerAnimation: visibilityData.animation,
      animationState: animationState,
      returnedAnimation: animation,
      activeElementsCount: activeElements.current.size
    });
  }

  const handleAnimationStart = useCallback((e: React.AnimationEvent) => {
    activeElements.current.add(e.currentTarget);
    if (_index === 0) {
      console.log(`[useCardVisibility:${card.word}] Animation START:`, {
        animationName: e.animationName,
        target: e.currentTarget,
        activeCount: activeElements.current.size,
        currentStatus: animationState.status
      });
    }
    setAnimationState((prev) => ({ ...prev, status: "animating" }));
  }, [card.word, animationState.status, _index]);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    activeElements.current.delete(e.currentTarget);
    if (_index === 0) {
      console.log(`[useCardVisibility:${card.word}] Animation END:`, {
        animationName: e.animationName,
        target: e.currentTarget,
        remainingCount: activeElements.current.size,
        currentStatus: animationState.status
      });
    }
    if (activeElements.current.size === 0) {
      if (_index === 0) {
        console.log(`[useCardVisibility:${card.word}] All animations complete, setting status to 'complete'`);
      }
      setAnimationState((prev) => ({ ...prev, status: "complete" }));
    }
  }, [card.word, animationState.status, _index]);

  return {
    state: visibilityData.state,
    animation,
    handleAnimationStart,
    handleAnimationEnd,
  };
};
