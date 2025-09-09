import React, { useCallback, useRef, useEffect, useState } from "react";
import { create } from "zustand";

// ============= TYPES =============
export type VisualState = "hidden" | "visible" | "visible-colored" | "visible-covered";

export type GameEvent = "deal-in" | "spymaster-reveal" | "spymaster-hide" | "cover-card";

export type ViewMode = "normal" | "spymaster";

export interface GameData {
  word: string;
  teamName: "red" | "blue" | "neutral" | "assassin";
}

export interface Card {
  word: string;
  teamName?: "red" | "blue" | "neutral" | "assassin";
  selected: boolean;
}

interface TransitionContext {
  viewMode: ViewMode;
  card: Card;
}

interface AnimationTracker {
  cardId: string;
  elementName: string;
  status: "pending" | "running" | "finished";
  progress: number;
  event?: GameEvent;
  startTime?: number;
}

interface AnimationDefinition {
  keyframes: Keyframe[];
  duration?: number;
  delay?: number | ((index: number) => number);
  easing?: string;
}

interface AnimationConfig {
  [event: string]: {
    [selector: string]: AnimationDefinition;
  };
}

// ============= ANIMATION CONFIG =============
export const CARD_ANIMATIONS: AnimationConfig = {
  "deal-in": {
    ".card-container": {
      keyframes: [
        {
          opacity: "0",
          transform: "translateY(-100vh) translateX(-50vw) rotate(-15deg) scale(0.8)",
        },
        { opacity: "1", transform: "translateY(0) translateX(0) rotate(0) scale(1)" },
      ],
      duration: 600,
      delay: (index) => index * 50,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    ".card-word": {
      keyframes: [
        { opacity: "0", transform: "scale(0.3)" },
        { opacity: "1", transform: "scale(1)" },
      ],
      duration: 400,
      delay: (index) => index * 50 + 200,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
  "spymaster-reveal": {
    ".card-word": {
      keyframes: [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.1)", filter: "brightness(1.2)" },
      ],
      duration: 300,
      delay: (index) => index * 20,
    },
    ".card-badge": {
      keyframes: [
        { opacity: "0", transform: "translateY(10px) scale(0.8)" },
        { opacity: "1", transform: "translateY(0) scale(1)" },
      ],
      duration: 400,
      delay: (index) => index * 20 + 150,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
  "spymaster-hide": {
    ".card-badge": {
      keyframes: [
        { opacity: "1", transform: "scale(1)" },
        { opacity: "0", transform: "scale(0.8)" },
      ],
      duration: 200,
      easing: "ease-in",
    },
  },
  "cover-card": {
    ".cover-card": {
      keyframes: [
        { opacity: "0", transform: "translateX(-100vw) translateY(-100vh) rotate(-6deg)" },
        { opacity: "1", transform: "translateX(0) translateY(0) rotate(0)" },
      ],
      duration: 600,
      delay: 50,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
};

// ============= STATE TRANSITIONS =============
export function deriveTargetState(
  currentState: VisualState,
  context: TransitionContext,
): { targetState: VisualState; event: GameEvent | null } {
  const { viewMode, card } = context;

  if (card.selected && card.teamName) {
    if (currentState !== "visible-covered") {
      return { targetState: "visible-covered", event: "cover-card" };
    }
    return { targetState: currentState, event: null };
  }

  if (viewMode === "spymaster") {
    if (currentState === "hidden") {
      return { targetState: "visible-colored", event: "deal-in" };
    }
    if (currentState === "visible") {
      return { targetState: "visible-colored", event: "spymaster-reveal" };
    }
    return { targetState: currentState, event: null };
  }

  if (currentState === "hidden") {
    return { targetState: "visible", event: "deal-in" };
  }
  if (currentState === "visible-colored") {
    return { targetState: "visible", event: "spymaster-hide" };
  }

  return { targetState: currentState, event: null };
}

// ============= ZUSTAND STORE =============
interface CardState {
  visualState: VisualState;
  transition?: {
    from: VisualState;
    to: VisualState;
    event: GameEvent;
    startedAt: number;
  };
}

interface CardVisibilityStore {
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  animationTrackers: AnimationTracker[];
  timeScale: number;

  initCard: (cardId: string, initialState: VisualState) => void;
  updateCardState: (cardId: string, state: VisualState) => void;
  startTransition: (cardId: string, from: VisualState, to: VisualState, event: GameEvent) => void;
  completeTransition: (cardId: string) => void;

  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  getCard: (cardId: string) => CardState | undefined;

  updateAnimationTracker: (tracker: AnimationTracker) => void;
  clearAnimationTrackers: (cardId: string) => void;
  setTimeScale: (scale: number) => void;

  reset: () => void;
}

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  cards: new Map(),
  viewMode: "normal",
  animationTrackers: [],
  timeScale: 1,

  initCard: (cardId, initialState) => {
    set((state) => {
      if (state.cards.has(cardId)) return state;

      const newCards = new Map(state.cards);
      newCards.set(cardId, { visualState: initialState });
      return { cards: newCards };
    });
  },

  updateCardState: (cardId, visualState) => {
    set((state) => {
      const newCards = new Map(state.cards);
      const card = newCards.get(cardId);
      if (card) {
        newCards.set(cardId, { ...card, visualState });
      }
      return { cards: newCards };
    });
  },

  startTransition: (cardId, from, to, event) => {
    console.log(`🎬 Starting transition for ${cardId}: ${from} -> ${to} (${event})`);
    set((state) => {
      const newCards = new Map(state.cards);
      newCards.set(cardId, {
        visualState: from,
        transition: { from, to, event, startedAt: Date.now() },
      });
      return { cards: newCards };
    });
  },

  completeTransition: (cardId) => {
    const card = get().cards.get(cardId);
    if (!card?.transition) return;

    console.log(
      `✅ Completed transition for ${cardId}: ${card.transition.from} -> ${card.transition.to}`,
    );
    set((state) => {
      const newCards = new Map(state.cards);
      newCards.set(cardId, {
        visualState: card.transition!.to,
        transition: undefined,
      });
      return { cards: newCards };
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () =>
    set((state) => ({ viewMode: state.viewMode === "normal" ? "spymaster" : "normal" })),

  getCard: (cardId) => get().cards.get(cardId),

  updateAnimationTracker: (tracker) =>
    set((state) => ({
      animationTrackers: [
        ...state.animationTrackers.filter(
          (t) => !(t.cardId === tracker.cardId && t.elementName === tracker.elementName),
        ),
        tracker,
      ],
    })),

  clearAnimationTrackers: (cardId) =>
    set((state) => ({
      animationTrackers: state.animationTrackers.filter((t) => t.cardId !== cardId),
    })),

  setTimeScale: (scale) => set({ timeScale: scale }),

  reset: () => set({ cards: new Map(), viewMode: "normal", animationTrackers: [] }),
}));

// ============= HOOKS =============
/**
 * Hook for managing card visibility state and transitions
 */
export function useCardVisibility(card: Card, initialState: VisualState = "visible") {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const cardState = useCardVisibilityStore((state) => state.getCard(card.word));
  const initCard = useCardVisibilityStore((state) => state.initCard);
  const startTransition = useCardVisibilityStore((state) => state.startTransition);
  const completeTransition = useCardVisibilityStore((state) => state.completeTransition);

  useEffect(() => {
    if (!cardState) {
      initCard(card.word, initialState);
    }
  }, [cardState, initCard, card.word, initialState]);

  const currentState = cardState?.visualState || initialState;
  const activeTransition = cardState?.transition;

  const context: TransitionContext = { viewMode, card };
  const { targetState, event } = deriveTargetState(currentState, context);

  useEffect(() => {
    const needsTransition = !activeTransition && currentState !== targetState && event;

    if (needsTransition && event) {
      console.log(`🔄 ${card.word}: ${currentState} -> ${targetState} (${event})`);
      startTransition(card.word, currentState, targetState, event);
    }
  }, [card.word, currentState, targetState, event, activeTransition, startTransition]);

  const handleComplete = useCallback(() => {
    completeTransition(card.word);
  }, [card.word, completeTransition]);

  return {
    state: currentState,
    targetState,
    isTransitioning: !!activeTransition,
    animationEvent: activeTransition?.event || null,
    completeTransition: handleComplete,
  };
}

// ============= ANIMATION CONTAINER COMPONENT =============
interface AnimationContainerProps {
  event: string | null;
  index?: number;
  onComplete?: () => void;
  animations: AnimationConfig;
  children: React.ReactNode;
  cardId: string;
}

export const AnimationContainer: React.FC<AnimationContainerProps> = ({
  event,
  index = 0,
  onComplete,
  animations,
  children,
  cardId,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const updateTracker = useCardVisibilityStore((s) => s.updateAnimationTracker);

  useEffect(() => {
    if (!ref.current || !event) return;

    const eventConfig = animations[event];
    if (!eventConfig) return;

    animationsRef.current.forEach((anim) => anim.cancel());
    animationsRef.current = [];

    const runningAnimations: Animation[] = [];
    const PENDING_DELAY = 200 * timeScale;

    Object.entries(eventConfig).forEach(([selector, definition]) => {
      const targets = ref.current!.querySelectorAll<HTMLElement>(selector);

      targets.forEach((target) => {
        const delay =
          typeof definition.delay === "function" ? definition.delay(index) : definition.delay || 0;

        setTimeout(() => {
          if (!ref.current?.contains(target)) return;

          const animation = target.animate(definition.keyframes, {
            duration: (definition.duration || 300) * timeScale,
            delay: 0,
            easing: definition.easing || "ease",
            fill: "both",
          });

          runningAnimations.push(animation);

          updateTracker({
            cardId,
            elementName: selector,
            status: "pending",
            progress: 0,
            event: event as GameEvent,
          });

          if (animation.playState === "running") {
            const updateProgress = () => {
              if (!animation.currentTime || !animation.effect?.getComputedTiming) return;
              const timing = animation.effect.getComputedTiming();
              const progress = timing.progress ?? 0;

              if (animation.playState === "running") {
                updateTracker({
                  cardId,
                  elementName: selector,
                  status: "running",
                  progress,
                  event: event as GameEvent,
                });
              }
            };

            const progressInterval = setInterval(updateProgress, 50);

            animation.finished
              .then(() => {
                clearInterval(progressInterval);
                updateTracker({
                  cardId,
                  elementName: selector,
                  status: "finished",
                  progress: 1,
                  event: event as GameEvent,
                });
              })
              .catch(() => {
                clearInterval(progressInterval);
              });
          }
        }, PENDING_DELAY);
      });
    });

    setTimeout(() => {
      animationsRef.current = runningAnimations;

      if (onComplete && runningAnimations.length > 0) {
        const allFinished = runningAnimations.map((anim) =>
          anim.finished.catch(() => {
            /* cancelled is ok */
          }),
        );

        Promise.all(allFinished).then(onComplete);
      }
    }, PENDING_DELAY);

    return () => {
      animationsRef.current.forEach((anim) => anim.cancel());
    };
  }, [event, index, onComplete, animations, timeScale, updateTracker, cardId]);

  return <div ref={ref}>{children}</div>;
};
