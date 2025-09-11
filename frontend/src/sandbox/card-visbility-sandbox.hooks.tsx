/**
 * Card Visibility Hooks v4.0
 * Entity context is stored in engine for debugging purposes only!
 * The engine remains generic - no business logic!
 */

import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { create } from "zustand";
import { useAnimationDevTools } from "./animation-devtools";

// ============= ANIMATION TYPES =============
export interface AnimationDefinition {
  keyframes: Keyframe[];
  options?: {
    duration?: number;
    delay?: number;
    easing?: string;
    fill?: FillMode;
    stagger?: number;
  };
}

export interface AnimationTriggerMap {
  [trigger: string]: AnimationDefinition;
}

export interface AnimationMetadata {
  elementId: string;
  entityId: string;
  [key: string]: any;
}

export interface EntityContext {
  [key: string]: any;
}

export interface AnimationOptions {
  index?: number;
  timeScale?: number;
}

export interface AnimationEngine {
  register(
    element: HTMLElement,
    animations: AnimationTriggerMap,
    metadata: AnimationMetadata,
  ): void;
  unregister(element: HTMLElement): void;
  setEntityContext(entityId: string, context: EntityContext): void;
  runAnimations(trigger: string, options?: AnimationOptions): Promise<void>;
  cancelAll(): void;
  dispose(): void;
  createRef(
    animations: AnimationTriggerMap,
    metadata: AnimationMetadata,
  ): (element: HTMLElement | null) => void;
  getSize(): number;
  isAnimating(): boolean;
}

// ============= CARD TYPES =============
export type CardDisplayState = "hidden" | "visible" | "visible-colored" | "visible-covered";
export type CardAnimationTrigger = "deal-in" | "spymaster-reveal" | "spymaster-hide" | "cover-card";
export type ViewMode = "normal" | "spymaster";

export interface Card {
  word: string;
  teamName?: "red" | "blue" | "neutral" | "assassin";
  selected: boolean;
}

interface CardState {
  displayState: CardDisplayState;
  transition?: {
    from: CardDisplayState;
    to: CardDisplayState;
    trigger: CardAnimationTrigger;
    startedAt: number;
  };
}

interface CardTransition {
  from: CardDisplayState;
  to: CardDisplayState;
  trigger: CardAnimationTrigger;
  condition: (card: Card, viewMode: ViewMode) => boolean;
}

// ============= ANIMATION ENGINE WITH ENTITY CONTEXT =============
function animateElement(
  element: HTMLElement,
  animDef: AnimationDefinition,
  index: number,
  timeScale: number,
): Animation | null {
  try {
    const staggerDelay = index * (animDef.options?.stagger || 0);
    const duration = animDef.options?.duration || 300;
    const delay = animDef.options?.delay || 0;

    const animationOptions: KeyframeAnimationOptions = {
      duration: duration / timeScale,
      delay: (delay + staggerDelay) / timeScale,
      easing: animDef.options?.easing,
      fill: animDef.options?.fill,
    };

    return element.animate(animDef.keyframes, animationOptions);
  } catch (error) {
    console.error("Animation failed:", error);
    return null;
  }
}

export function useAnimationEngine(): AnimationEngine {
  const devtools = useAnimationDevTools();
  const engineId = useRef(`engine-${Math.random().toString(36).slice(2)}`).current;
  const elementRegistry = useRef(
    new Map<
      HTMLElement,
      {
        animations: AnimationTriggerMap;
        metadata: AnimationMetadata;
      }
    >(),
  );
  const activeAnimations = useRef(new Map<HTMLElement, Animation>());
  const entityContexts = useRef(new Map<string, EntityContext>());

  const engine = useMemo<AnimationEngine>(() => {
    const cancelAnimation = (element: HTMLElement) => {
      const animation = activeAnimations.current.get(element);
      if (animation) {
        try {
          animation.cancel();
        } catch (e) {}
        activeAnimations.current.delete(element);
      }
    };

    const cancelAll = () => {
      activeAnimations.current.forEach((animation) => {
        try {
          animation.cancel();
        } catch (e) {}
      });
      activeAnimations.current.clear();
    };

    const register = (
      element: HTMLElement,
      animations: AnimationTriggerMap,
      metadata: AnimationMetadata,
    ) => {
      elementRegistry.current.set(element, { animations, metadata });
      // Notify devtools of change
      if (devtools) {
        devtools.registerEngine(engineId, {
          // Direct refs (for old compatibility)
          elementRegistry: elementRegistry.current,
          activeAnimations: activeAnimations.current,
          entityContexts: entityContexts.current,
          // Getter functions (for new DevTools)
          getElementRegistry: () => elementRegistry.current,
          getActiveAnimations: () => activeAnimations.current,
          getEntityContexts: () => entityContexts.current,
        });
      }
    };

    const unregister = (element: HTMLElement) => {
      elementRegistry.current.delete(element);
      cancelAnimation(element);
    };

    const setEntityContext = (entityId: string, context: EntityContext) => {
      entityContexts.current.set(entityId, context);
    };

    const createRef = (animations: AnimationTriggerMap, metadata: AnimationMetadata) => {
      let myElement: HTMLElement | null = null;
      return (element: HTMLElement | null) => {
        if (!element && myElement) {
          unregister(myElement);
          myElement = null;
          return;
        }
        if (element) {
          myElement = element;
          register(element, animations, metadata);
        }
      };
    };

    const runAnimations = async (
      trigger: string,
      options: AnimationOptions = {},
    ): Promise<void> => {
      const { index = 0, timeScale = 1 } = options;
      cancelAll();
      const animationPromises: Promise<void>[] = [];

      elementRegistry.current.forEach((data, element) => {
        const { entityId, elementId } = data.metadata;

        // Just get the animation - no smart selection!
        const animDef = data.animations[trigger];
        if (!animDef) return;

        const duration = (animDef.options?.duration || 300) / timeScale;
        const startTime = Date.now();

        // Update animation tracker in devtools
        if (devtools) {
          const trackerKey = `${entityId}-${elementId}`;
          devtools.updateAnimationTracker(trackerKey, {
            entityId,
            elementId,
            status: "pending",
            progress: 0,
            trigger,
            startTime,
            duration,
          });
        }

        const animation = animateElement(element, animDef, index, timeScale);
        if (animation) {
          activeAnimations.current.set(element, animation);

          animation.ready.then(() => {
            if (devtools) {
              const trackerKey = `${entityId}-${elementId}`;
              devtools.updateAnimationTracker(trackerKey, {
                entityId,
                elementId,
                status: "running",
                progress: 0,
                trigger,
                startTime,
                duration,
              });
            }

            const updateProgress = () => {
              if (!animation.currentTime || !animation.effect?.getComputedTiming) return;
              const timing = animation.effect.getComputedTiming();
              const progress = timing.progress ?? 0;

              if (animation.playState === "running" && devtools) {
                const trackerKey = `${entityId}-${elementId}`;
                devtools.updateAnimationTracker(trackerKey, {
                  entityId,
                  elementId,
                  status: "running",
                  progress,
                  trigger,
                  startTime,
                  duration,
                });
              }
            };

            const progressInterval = setInterval(updateProgress, 50);

            animation.finished
              .then(() => {
                clearInterval(progressInterval);
                if (devtools) {
                  const trackerKey = `${entityId}-${elementId}`;
                  devtools.updateAnimationTracker(trackerKey, {
                    entityId,
                    elementId,
                    status: "finished",
                    progress: 1,
                    trigger,
                    startTime,
                    duration,
                  });
                }
                activeAnimations.current.delete(element);
              })
              .catch(() => {
                clearInterval(progressInterval);
                activeAnimations.current.delete(element);
              });
          });

          animationPromises.push(animation.finished.then(() => {}).catch(() => {}));
        }
      });

      if (animationPromises.length > 0) {
        await Promise.all(animationPromises);
      }
    };

    const dispose = () => {
      cancelAll();
      elementRegistry.current.clear();
      entityContexts.current.clear();
    };

    return {
      register,
      unregister,
      setEntityContext,
      runAnimations,
      cancelAll,
      dispose,
      createRef,
      getSize: () => elementRegistry.current.size,
      isAnimating: () => activeAnimations.current.size > 0,
    };
  }, [devtools, engineId]);

  // Initial registration with devtools
  useEffect(() => {
    if (devtools) {
      // Register with current state
      devtools.registerEngine(engineId, {
        // Direct refs (for old compatibility)
        elementRegistry: elementRegistry.current,
        activeAnimations: activeAnimations.current,
        entityContexts: entityContexts.current,
        // Getter functions (for new DevTools)
        getElementRegistry: () => elementRegistry.current,
        getActiveAnimations: () => activeAnimations.current,
        getEntityContexts: () => entityContexts.current,
      });
      return () => {
        devtools.unregisterEngine(engineId);
      };
    }
  }, [devtools, engineId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engine.dispose();
    };
  }, [engine]);

  return engine;
}

// ============= ANIMATION HOOK WITH ENTITY CONTEXT =============
export interface UseAnimationProps {
  trigger: string | null;
  onComplete?: () => void;
  onStart?: () => void;
  index?: number;
  timeScale?: number;
  entityId?: string; // NEW!
  entityContext?: EntityContext; // NEW!
}

export function useAnimation({
  trigger,
  onComplete,
  onStart,
  index = 0,
  timeScale = 1,
  entityId,
  entityContext,
}: UseAnimationProps) {
  const engine = useAnimationEngine();
  const devtools = useAnimationDevTools();

  // Set entity context in engine AND devtools
  useEffect(() => {
    if (entityId && entityContext) {
      engine.setEntityContext(entityId, entityContext);

      // Also set in devtools for display
      if (devtools) {
        devtools.setEntityContext(entityId, entityContext);
      }
    }
  }, [engine, devtools, entityId, entityContext]);

  const animationRef = useCallback(
    (animations: AnimationTriggerMap, metadata: AnimationMetadata) =>
      engine.createRef(animations, metadata),
    [engine],
  );

  useEffect(() => {
    if (!trigger) return;
    if (onStart) onStart();

    engine.runAnimations(trigger, { index, timeScale }).then(() => {
      if (onComplete) onComplete();
    });

    return () => {
      engine.cancelAll();
    };
  }, [trigger, onComplete, onStart, index, timeScale, engine]);

  return { animationRef };
}

// ============= CARD VISIBILITY STORE (CLEAN!) =============
interface CardVisibilityStore {
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  timeScale: number;

  actions: {
    initCard: (cardId: string, initialState: CardDisplayState) => void;
    startTransition: (
      cardId: string,
      from: CardDisplayState,
      to: CardDisplayState,
      trigger: CardAnimationTrigger,
    ) => void;
    completeTransition: (cardId: string) => void;
    setViewMode: (mode: ViewMode) => void;
    toggleViewMode: () => void;
    setTimeScale: (scale: number) => void;
    reset: () => void;
  };
}

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  cards: new Map(),
  viewMode: "normal",
  timeScale: 1,

  actions: {
    initCard: (cardId, initialState) => {
      set((state) => {
        if (state.cards.has(cardId)) return state;
        const newCards = new Map(state.cards);
        newCards.set(cardId, { displayState: initialState });
        return { cards: newCards };
      });
    },

    startTransition: (cardId, from, to, trigger) => {
      set((state) => {
        const newCards = new Map(state.cards);
        newCards.set(cardId, {
          displayState: from,
          transition: { from, to, trigger, startedAt: Date.now() },
        });
        return { cards: newCards };
      });
    },

    completeTransition: (cardId) => {
      const card = get().cards.get(cardId);
      if (!card?.transition) return;
      set((state) => {
        const newCards = new Map(state.cards);
        newCards.set(cardId, {
          displayState: card.transition!.to,
          transition: undefined,
        });
        return { cards: newCards };
      });
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    toggleViewMode: () =>
      set((state) => ({
        viewMode: state.viewMode === "normal" ? "spymaster" : "normal",
      })),
    setTimeScale: (scale) => set({ timeScale: scale }),
    reset: () => set({ cards: new Map(), viewMode: "normal" }),
  },
}));

// ============= STATE MACHINE =============
const CARD_TRANSITIONS: CardTransition[] = [
  {
    from: "hidden",
    to: "visible",
    trigger: "deal-in",
    condition: (card, viewMode) => viewMode === "normal",
  },
  {
    from: "hidden",
    to: "visible-colored",
    trigger: "deal-in",
    condition: (card, viewMode) => viewMode === "spymaster" && !!card.teamName,
  },
  {
    from: "visible",
    to: "visible-colored",
    trigger: "spymaster-reveal",
    condition: (card, viewMode) => viewMode === "spymaster" && !!card.teamName,
  },
  {
    from: "visible-colored",
    to: "visible",
    trigger: "spymaster-hide",
    condition: (card, viewMode) => viewMode === "normal" && !card.selected,
  },
  {
    from: "visible",
    to: "visible-covered",
    trigger: "cover-card",
    condition: (card) => card.selected && !!card.teamName,
  },
  {
    from: "visible-colored",
    to: "visible-covered",
    trigger: "cover-card",
    condition: (card) => card.selected && !!card.teamName,
  },
];

function deriveTargetState(
  currentState: CardDisplayState,
  card: Card,
  viewMode: ViewMode,
): { targetState: CardDisplayState; trigger: CardAnimationTrigger | null } {
  const transition = CARD_TRANSITIONS.find(
    (t) => t.from === currentState && t.condition(card, viewMode),
  );
  return transition
    ? { targetState: transition.to, trigger: transition.trigger }
    : { targetState: currentState, trigger: null };
}

// ============= CARD VISIBILITY HOOK - THE ORCHESTRATOR =============
export interface CardVisibilityOptions {
  index?: number;
}

export interface CardVisibilityResult {
  displayState: CardDisplayState;
  animatedRef: (animations: AnimationTriggerMap) => (element: HTMLElement | null) => void;
}

export function useCardVisibility(
  card: Card,
  initialState: CardDisplayState = "hidden",
  options?: CardVisibilityOptions,
): CardVisibilityResult {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const timeScale = useCardVisibilityStore((state) => state.timeScale);
  const cardState = useCardVisibilityStore(
    useCallback((state) => state.cards.get(card.word), [card.word]),
  );
  const actions = useCardVisibilityStore((state) => state.actions);

  useEffect(() => {
    if (!cardState) {
      actions.initCard(card.word, initialState);
    }
  }, [cardState, actions, card.word, initialState]);

  const currentState = cardState?.displayState || initialState;
  const activeTransition = cardState?.transition;

  const { targetState, trigger } = useMemo(
    () => deriveTargetState(currentState, card, viewMode),
    [currentState, card, viewMode],
  );

  useEffect(() => {
    const needsTransition = !activeTransition && currentState !== targetState && trigger;
    if (needsTransition && trigger) {
      actions.startTransition(card.word, currentState, targetState, trigger);
    }
  }, [card.word, currentState, targetState, trigger, activeTransition, actions]);

  const handleComplete = useCallback(() => {
    actions.completeTransition(card.word);
  }, [card.word, actions]);

  // Build entity context
  const entityContext = useMemo(
    () => ({
      word: card.word,
      teamName: card.teamName,
      selected: card.selected,
      displayState: currentState,
      transition: activeTransition,
      viewMode,
      timeScale,
    }),
    [card, currentState, activeTransition, viewMode, timeScale],
  );

  // Pass entity context to useAnimation!
  const { animationRef } = useAnimation({
    trigger: activeTransition?.trigger || null,
    onComplete: handleComplete,
    index: options?.index || 0,
    timeScale,
    entityId: card.word, // Pass entity ID
    entityContext, // Pass entity context!
  });

  // Create element refs with minimal metadata
  const animatedRef = useCallback(
    (animations: AnimationTriggerMap) => {
      return (element: HTMLElement | null) => {
        if (element && animations) {
          // Just element-specific metadata
          const metadata: AnimationMetadata = {
            elementId: element.id || element.className || element.tagName.toLowerCase(),
            entityId: card.word,

            // Element-specific data only
            ...element.dataset,
            className: element.className,
            tagName: element.tagName,
            domId: element.id,
          };

          const ref = animationRef(animations, metadata);
          ref(element);
        }
      };
    },
    [animationRef, card.word],
  );

  return {
    displayState: currentState,
    animatedRef,
  };
}

// ============= ANIMATION DEFINITIONS =============
export const CARD_ANIMATIONS: Record<string, AnimationTriggerMap> = {
  // Base card animations
  baseCard: {
    "deal-in": {
      keyframes: [
        { opacity: "0", transform: "translateY(-100vh) rotate(-15deg) scale(0.8)" },
        { opacity: "1", transform: "translateY(0) rotate(0) scale(1)" },
      ],
      options: { duration: 600, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", stagger: 50 },
    },
  },

  // Container animations for each team
  container: {
    "deal-in": {
      keyframes: [
        { opacity: "0", transform: "translateY(-100vh) rotate(-15deg) scale(0.8)" },
        { opacity: "1", transform: "translateY(0) rotate(0) scale(1)" },
      ],
      options: { duration: 600, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", stagger: 50 },
    },
    "spymaster-reveal": {
      keyframes: [{ filter: "brightness(1)" }, { filter: "brightness(1.2)" }],
      options: { duration: 500, easing: "ease-in-out", fill: "forwards" },
    },
    "spymaster-hide": {
      keyframes: [{ filter: "brightness(1.2)" }, { filter: "brightness(1)" }],
      options: { duration: 300, easing: "ease-in-out", fill: "forwards" },
    },
  },

  word: {
    "deal-in": {
      keyframes: [
        { opacity: "0", transform: "scale(0.3)" },
        { opacity: "1", transform: "scale(1)" },
      ],
      options: {
        duration: 400,
        delay: 200,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        stagger: 50,
      },
    },
    "spymaster-reveal": {
      keyframes: [
        { transform: "scale(1)" },
        { transform: "scale(1.05)" },
        { transform: "scale(1)" },
      ],
      options: { duration: 400, delay: 100, easing: "ease-in-out" },
    },
  },

  badge: {
    "spymaster-reveal": {
      keyframes: [
        { opacity: "0", transform: "translateY(10px) scale(0.8)" },
        { opacity: "1", transform: "translateY(0) scale(1)" },
      ],
      options: {
        duration: 400,
        delay: 150,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        stagger: 20,
      },
    },
    "spymaster-hide": {
      keyframes: [
        { opacity: "1", transform: "scale(1)" },
        { opacity: "0", transform: "scale(0.8)" },
      ],
      options: { duration: 200, easing: "ease-in", stagger: 0 },
    },
  },

  coverCard: {
    "cover-card": {
      keyframes: [
        { opacity: "0", transform: "translateY(-100vh) rotate(-15deg) scale(0.8)" },
        { opacity: "1", transform: "translateY(0) rotate(0) scale(1)" },
      ],
      options: {
        duration: 600,
        delay: 50,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "both",
      },
    },
  },
};
