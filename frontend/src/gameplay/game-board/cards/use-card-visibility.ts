import React, { useCallback, useState, useRef, useMemo } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
import type { VisualState, AnimationType, CardVisibilityData } from "./card-visibility-provider";

export interface CardVisibility {
  state: VisualState;
  animation: AnimationType;
  handleAnimationStart: (e: React.AnimationEvent) => void;
  handleAnimationEnd: (e: React.AnimationEvent) => void;
}

// Default visibility data to avoid creating new objects
const DEFAULT_VISIBILITY_DATA: CardVisibilityData = {
  state: "hidden" as VisualState,
  animation: null
};

/**
 * Hook manages animation status lifecycle to handle React dev mode double-rendering
 * Status persists animation attributes across renders until CSS animations complete
 */
export const useCardVisibility = (card: Card): CardVisibility => {
  // Use a stable selector
  const visibilityData = useCardVisibilityStore(
    useCallback(
      (state) => state.cardData.get(card.word) || DEFAULT_VISIBILITY_DATA,
      [card.word]
    )
  );
  
  const setCardData = useCardVisibilityStore(state => state.setCardData);

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

  // Use useEffect to update state
  React.useEffect(() => {
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
  }, [visibilityData.animation, visibilityData.state]);

  const animation = transitionState.status === "waiting" || transitionState.status === "animating"
    ? transitionState.animation
    : null;

  const handleAnimationStart = useCallback(
    (e: React.AnimationEvent) => {
      activeElements.current.add(e.currentTarget);
      setTransitionState((prev) => ({ ...prev, status: "animating" }));
    },
    []
  );

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (activeElements.current.has(e.target)) {
      activeElements.current.delete(e.target);
      setTransitionState((prev) => ({ ...prev, status: "complete" }));
      
      // Get fresh cardData inside the callback
      const currentCardData = useCardVisibilityStore.getState().cardData;
      const updatedData = new Map(currentCardData);
      const current = updatedData.get(card.word);
      if (current && current.animation) {
        updatedData.set(card.word, { ...current, animation: null });
        setCardData(updatedData);
      }
    }
  }, [card.word, setCardData]);

  // Clean up on unmount
  React.useLayoutEffect(() => {
    return () => {
      // Component unmounting - clean up any pending animations
    };
  }, [card.word, transitionState.status]);

  return {
    state: visibilityData.state,
    animation,
    handleAnimationStart,
    handleAnimationEnd,
  };
};