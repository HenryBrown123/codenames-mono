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

interface CardTransition {
  from: VisualState;
  to: VisualState;
  animation: GameEvent;
  condition: (card: Card, viewMode: ViewMode) => boolean;
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
    cardContainer: {
      keyframes: [
        {
          opacity: "0",
          transform: "translateY(-100vh) translateX(-50vw) rotate(-15deg) scale(0.8)",
        },
        { opacity: "1", transform: "translateY(0) translateX(0) rotate(0) scale(1)" },
      ],
      duration: 600,
      delay: (index) => index * 50,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Overshoot for that bouncy feel
    },
    cardWord: {
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
    cardWord: {
      keyframes: [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.1)", filter: "brightness(1.2)" },
      ],
      duration: 300,
      delay: (index) => index * 20,
      easing: "ease-out",
    },
    cardBadge: {
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
    cardBadge: {
      keyframes: [
        { opacity: "1", transform: "scale(1)" },
        { opacity: "0", transform: "scale(0.8)" },
      ],
      duration: 200,
      easing: "ease-in",
    },
  },
  "cover-card": {
    coverCard: {
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

// ============= STATE MACHINE TRANSITIONS =============
export const CARD_TRANSITIONS: CardTransition[] = [
  // Cards appear with dealing animation (normal view)
  {
    from: "hidden",
    to: "visible",
    animation: "deal-in",
    condition: (card, viewMode) => viewMode === "normal",
  },
  // Cards deal directly to colored in spymaster view
  {
    from: "hidden",
    to: "visible-colored",
    animation: "deal-in",
    condition: (card, viewMode) => viewMode === "spymaster" && !!card.teamName,
  },
  // Cards reveal their team colors when entering spymaster view
  {
    from: "visible",
    to: "visible-colored",
    animation: "spymaster-reveal",
    condition: (card, viewMode) => viewMode === "spymaster" && !!card.teamName,
  },
  // Cards hide their team colors when leaving spymaster view
  {
    from: "visible-colored",
    to: "visible",
    animation: "spymaster-hide",
    condition: (card, viewMode) => viewMode === "normal" && !card.selected,
  },
  // Cards cover when selected (from neutral state)
  {
    from: "visible",
    to: "visible-covered",
    animation: "cover-card",
    condition: (card) => card.selected && !!card.teamName,
  },
  // Cards cover when selected (from colored state)
  {
    from: "visible-colored",
    to: "visible-covered",
    animation: "cover-card",
    condition: (card) => card.selected && !!card.teamName,
  },
];

/**
 * Derive the target state and animation event based on current state and context
 */
export function deriveTargetState(
  currentState: VisualState,
  card: Card,
  viewMode: ViewMode,
): { targetState: VisualState; event: GameEvent | null } {
  // Find matching transition from current state
  const transition = CARD_TRANSITIONS.find(
    (t) => t.from === currentState && t.condition(card, viewMode),
  );

  if (transition) {
    return { targetState: transition.to, event: transition.animation };
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
  // State - flat for easy access
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  animationTrackers: AnimationTracker[];
  timeScale: number;

  // Actions - grouped for organization
  actions: {
    initCard: (cardId: string, initialState: VisualState) => void;
    updateCardState: (cardId: string, state: VisualState) => void;
    startTransition: (cardId: string, from: VisualState, to: VisualState, event: GameEvent) => void;
    completeTransition: (cardId: string) => void;
    setViewMode: (mode: ViewMode) => void;
    toggleViewMode: () => void;
    updateAnimationTracker: (tracker: AnimationTracker) => void;
    clearAnimationTrackers: (cardId: string) => void;
    setTimeScale: (scale: number) => void;
    reset: () => void;
  };
}

/**
 * Global store for card visibility state management
 */
export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  // State
  cards: new Map(),
  viewMode: "normal",
  animationTrackers: [],
  timeScale: 1,

  // Actions
  actions: {
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
  },
}));

// ============= HOOKS =============
/**
 * Hook for managing card visibility state and transitions
 * Uses state machine to determine transitions and animations
 */
export function useCardVisibility(card: Card, initialState: VisualState = "visible") {
  // State selectors
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const cardState = useCardVisibilityStore(
    useCallback((state) => state.cards.get(card.word), [card.word]),
  );

  // Actions - single stable reference
  const actions = useCardVisibilityStore((state) => state.actions);

  // Initialize card if it doesn't exist
  useEffect(() => {
    if (!cardState) {
      actions.initCard(card.word, initialState);
    }
  }, [cardState, actions, card.word, initialState]);

  const currentState = cardState?.visualState || initialState;
  const activeTransition = cardState?.transition;

  // Use state machine to determine target state
  const { targetState, event } = deriveTargetState(currentState, card, viewMode);

  // Trigger transitions when needed
  useEffect(() => {
    const needsTransition = !activeTransition && currentState !== targetState && event;

    if (needsTransition && event) {
      console.log(`🔄 ${card.word}: ${currentState} -> ${targetState} (${event})`);
      actions.startTransition(card.word, currentState, targetState, event);
    }
  }, [card.word, currentState, targetState, event, activeTransition, actions]);

  const handleComplete = useCallback(() => {
    actions.completeTransition(card.word);
  }, [card.word, actions]);

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

/**
 * Container component that orchestrates Web Animations API animations
 * Handles animation scheduling, progress tracking, and lifecycle management
 */
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
  const updateTracker = useCardVisibilityStore((s) => s.actions.updateAnimationTracker);

  useEffect(() => {
    if (!ref.current || !event) return;

    const eventConfig = animations[event];
    if (!eventConfig) return;

    // Cancel any existing animations
    animationsRef.current.forEach((anim) => anim.cancel());
    animationsRef.current = [];

    const runningAnimations: Animation[] = [];

    // Create animations for each selector in the config
    Object.entries(eventConfig).forEach(([selector, definition]) => {
      const targets = ref.current!.querySelectorAll<HTMLElement>(`.${selector}`);

      targets.forEach((target) => {
        // Calculate delay based on index if function, otherwise use static delay
        const delay =
          typeof definition.delay === "function" ? definition.delay(index) : definition.delay || 0;

        // Create animation with native Web Animations API
        const animation = target.animate(definition.keyframes, {
          duration: (definition.duration || 300) * timeScale,
          delay: delay * timeScale,
          easing: definition.easing || "ease",
          fill: "both",
        });

        runningAnimations.push(animation);

        // Track animation as pending initially
        updateTracker({
          cardId,
          elementName: selector,
          status: "pending",
          progress: 0,
          event: event as GameEvent,
        });

        // When animation actually starts playing (after its delay) animation.ready resolves...
        // this means anything contained in the .then () callback runs after the animation starts.
        animation.ready.then(() => {
          // Update status to running
          updateTracker({
            cardId,
            elementName: selector,
            status: "running",
            progress: 0,
            event: event as GameEvent,
          });

          // Set up progress tracking.... useful for debug/visualisation within demos...
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

          // Poll for progress updates..
          const progressInterval = setInterval(updateProgress, 50);

          // Clean up when animation completes
          // This promise is nested to ensure proper lifecycle ordering... i.e animation.ready callback will always run
          // before the finished callback.. even if they resolve at inconsistent times (even if unlikely..)
          animation.finished
            .then(() => {
              clearInterval(progressInterval); // Stop polling
              updateTracker({
                cardId,
                elementName: selector,
                status: "finished",
                progress: 1,
                event: event as GameEvent,
              });
            })
            .catch(() => {
              // Animation was cancelled - clean up interval
              clearInterval(progressInterval);
            });
        });
      });
    });

    // Store reference to all animations for cleanup
    animationsRef.current = runningAnimations;

    // Handle completion callback when ALL animations finish
    if (onComplete && runningAnimations.length > 0) {
      // Promise.all waits for all animations
      // This just registers a callback for when they're all done
      Promise.all(runningAnimations.map((anim) => anim.finished.catch(() => {}))).then(onComplete);
    }

    // Cleanup function - runs on unmount or when dependencies change
    return () => {
      animationsRef.current.forEach((anim) => anim.cancel());
    };
  }, [event, index, onComplete, animations, timeScale, updateTracker, cardId]);

  return <div ref={ref}>{children}</div>;
};
