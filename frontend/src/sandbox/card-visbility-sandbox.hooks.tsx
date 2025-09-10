import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { create } from "zustand";

// ============= ANIMATION TYPES =============
export interface AnimationDefinition {
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions & {
    stagger?: number;
  };
}

export interface AnimationTriggerMap {
  [trigger: string]: AnimationDefinition;
}

export interface AnimationOptions {
  index?: number;
  timeScale?: number;
}

export interface AnimationEngine {
  register(element: HTMLElement, animations: AnimationTriggerMap): void;
  unregister(element: HTMLElement): void;
  runAnimations(trigger: string, options?: AnimationOptions): Promise<void>;
  cancelAll(): void;
  dispose(): void;
  createRef(animations: AnimationTriggerMap): (element: HTMLElement | null) => void;
  getSize(): number;
  isAnimating(): boolean;
}

export interface AnimationTracker {
  cardId: string;
  elementName: string;
  startTime: number;
  duration: number;
  trigger: string;
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

// ============= ANIMATION ENGINE =============
function animateElement(
  element: HTMLElement,
  animDef: AnimationDefinition,
  index: number,
  timeScale: number,
): Animation | null {
  try {
    const staggerDelay = index * (animDef.options?.stagger || 0);
    let duration = 0;
    if (typeof animDef.options?.duration === "number") {
      duration = animDef.options.duration;
    }
    let delay = 0;
    if (typeof animDef.options?.delay === "number") {
      delay = animDef.options.delay;
    }

    const animationOptions: KeyframeAnimationOptions = {
      duration: duration / timeScale,
      delay: (delay + staggerDelay) / timeScale,
      easing: animDef.options?.easing,
      fill: animDef.options?.fill,
    };

    return element.animate(animDef.keyframes, animationOptions);
  } catch (error) {
    console.error("Animation failed:", error);
    if (animDef.keyframes.length > 0) {
      const finalKeyframe = animDef.keyframes[animDef.keyframes.length - 1];
      Object.assign(element.style, finalKeyframe);
    }
    return null;
  }
}

export function useAnimationEngine(): AnimationEngine {
  const elementRegistry = useRef(new Map<HTMLElement, AnimationTriggerMap>());
  const activeAnimations = useRef(new Map<HTMLElement, Animation>());

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

    const register = (element: HTMLElement, animations: AnimationTriggerMap) => {
      elementRegistry.current.set(element, animations);
    };

    const unregister = (element: HTMLElement) => {
      elementRegistry.current.delete(element);
      cancelAnimation(element);
    };

    const createRef = (animations: AnimationTriggerMap) => {
      let myElement: HTMLElement | null = null;
      return (element: HTMLElement | null) => {
        if (!element && myElement) {
          unregister(myElement);
          myElement = null;
          return;
        }
        if (element) {
          myElement = element;
          register(element, animations);
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

      elementRegistry.current.forEach((animations, element) => {
        const animDef = animations[trigger];
        if (!animDef) return;

        const animation = animateElement(element, animDef, index, timeScale);
        if (animation) {
          activeAnimations.current.set(element, animation);
          animationPromises.push(
            animation.finished
              .then(() => {
                activeAnimations.current.delete(element);
              })
              .catch(() => {
                activeAnimations.current.delete(element);
              }),
          );
        }
      });

      if (animationPromises.length > 0) {
        await Promise.all(animationPromises);
      }
    };

    const dispose = () => {
      cancelAll();
      elementRegistry.current.clear();
    };

    return {
      register,
      unregister,
      runAnimations,
      cancelAll,
      dispose,
      createRef,
      getSize: () => elementRegistry.current.size,
      isAnimating: () => activeAnimations.current.size > 0,
    };
  }, []);

  return engine;
}

// ============= ANIMATION HOOK =============
export interface UseAnimationProps {
  trigger: string | null;
  onComplete?: () => void;
  onStart?: () => void;
  index?: number;
  timeScale?: number;
}

export function useAnimation({
  trigger,
  onComplete,
  onStart,
  index = 0,
  timeScale = 1,
}: UseAnimationProps) {
  const engine = useAnimationEngine();
  const animationRef = engine.createRef;

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

  useEffect(() => {
    return () => {
      engine.dispose();
    };
  }, [engine]);

  return { animationRef };
}

// ============= CARD VISIBILITY STORE =============
interface CardVisibilityStore {
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  timeScale: number;
  animationTrackers: AnimationTracker[];

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
    updateAnimationTracker: (tracker: AnimationTracker) => void;
    clearAnimationTrackers: (cardId: string) => void;
    reset: () => void;
  };
}

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  cards: new Map(),
  viewMode: "normal",
  timeScale: 1,
  animationTrackers: [],

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

    reset: () => set({ cards: new Map(), viewMode: "normal", animationTrackers: [] }),
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

// ============= ANIMATED ELEMENT CONFIG =============
export interface AnimatedElementConfig {
  id: string;
  animations?: AnimationTriggerMap;
  onMount?: (element: HTMLElement) => void;
}

export interface CardVisibilityOptions {
  index?: number;
}

export interface CardVisibilityResult {
  displayState: CardDisplayState;
  animatedRef: (config: AnimatedElementConfig) => (element: HTMLElement | null) => void;
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
  const elements = useRef(new Map<string, HTMLElement>());

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

      // Track animations for swimlanes
      const duration = trigger === "deal-in" ? 600 : 400;
      ["container", "word", "badge", "coverCard"].forEach((elementName) => {
        actions.updateAnimationTracker({
          cardId: card.word,
          elementName,
          startTime: Date.now(),
          duration,
          trigger,
        });
      });
    }
  }, [card.word, currentState, targetState, trigger, activeTransition, actions]);

  const handleComplete = useCallback(() => {
    actions.completeTransition(card.word);
    actions.clearAnimationTrackers(card.word);
  }, [card.word, actions]);

  const { animationRef } = useAnimation({
    trigger: activeTransition?.trigger || null,
    onComplete: handleComplete,
    index: options?.index || 0,
    timeScale,
  });

  const animatedRef = useCallback(
    (config: AnimatedElementConfig) => {
      return (element: HTMLElement | null) => {
        if (element) {
          elements.current.set(config.id, element);
          if (config.animations) {
            const ref = animationRef(config.animations);
            ref(element);
          }
          config.onMount?.(element);
        } else {
          const stored = elements.current.get(config.id);
          if (stored && config.animations) {
            const ref = animationRef(config.animations);
            ref(null);
          }
          elements.current.delete(config.id);
        }
      };
    },
    [animationRef],
  );

  return {
    displayState: currentState,
    animatedRef,
  };
}

// ============= ANIMATION DEFINITIONS =============
export const CARD_ANIMATIONS: Record<string, AnimationTriggerMap> = {
  container: {
    "deal-in": {
      keyframes: [
        {
          opacity: "0",
          transform: "translateY(-100vh) translateX(-50vw) rotate(-15deg) scale(0.8)",
        },
        { opacity: "1", transform: "translateY(0) translateX(0) rotate(0) scale(1)" },
      ],
      options: {
        duration: 600,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        stagger: 50,
      },
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
      options: {
        duration: 200,
        easing: "ease-in",
        stagger: 0,
      },
    },
  },
  coverCard: {
    "cover-card": {
      keyframes: [
        { opacity: "0", transform: "translateX(-100vw) translateY(-100vh) rotate(-6deg)" },
        { opacity: "1", transform: "translateX(0) translateY(0) rotate(0)" },
      ],
      options: {
        duration: 600,
        delay: 50,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        stagger: 0,
      },
    },
  },
};
