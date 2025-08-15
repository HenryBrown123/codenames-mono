import React, { useCallback, useState, useRef, useEffect } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibilityStore } from "./card-visibility-store";
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
  // Subscribe to ONLY this card's data - key for performance!
  const visibilityData = useCardVisibilityStore(
    state => state.cardData.get(card.word) || { state: "hidden" as VisualState, animation: null }
  );
  
  const setCardData = useCardVisibilityStore(state => state.setCardData);
  const cardData = useCardVisibilityStore(state => state.cardData);

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

  const handleAnimationStart = useCallback(
    (e: React.AnimationEvent) => {
      activeElements.current.add(e.currentTarget);
      setTransitionState((prev) => ({ ...prev, status: "animating" }));
    },
    [card.word, transitionState.animation],
  );

  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent) => {
      activeElements.current.delete(e.currentTarget);
      if (activeElements.current.size === 0) {
        setTransitionState((prev) => ({ ...prev, status: "complete" }));
        
        // Clear animation from store
        const updatedData = new Map(cardData);
        const current = updatedData.get(card.word);
        if (current) {
          updatedData.set(card.word, { ...current, animation: null });
          setCardData(updatedData);
        }
      }
    },
    [card.word, cardData, setCardData],
  );

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