/**
 * card-visibility-sandbox.hooks.tsx
 * Card Transition System v8.0
 *
 * Event-driven architecture with:
 * - Pure business logic functions (testable, no side effects)
 * - Store with integrated actions (using get() to avoid subscriptions)
 * - useCardVisibility: Unified hook for all card concerns
 * - Single animation engine with efficient nested Map structure
 * - Animations as part of state transitions, not side effects
 * - Clean separation: Components → Store/Hooks → Pure Functions
 */

import React, { useCallback, useEffect } from "react";
import { create } from "zustand";

// ============= TYPES =============

export type CardDisplayState = "hidden" | "visible" | "visible-colored" | "visible-covered";

export type ViewMode = "normal" | "spymaster";

export type CardEvent = "deal" | "reveal-colors" | "hide-colors" | "select" | "reset";

export interface Card {
  word: string;
  teamName?: "red" | "blue" | "neutral" | "assassin";
  selected: boolean;
}

export interface CardState {
  displayState: CardDisplayState;
  pendingState?: CardDisplayState;
  isTransitioning: boolean;
}

export interface CardTransition {
  fromState: CardDisplayState;
  toState: CardDisplayState;
  event: CardEvent;
}

export interface Transition {
  from: CardDisplayState;
  to: CardDisplayState;
  event: CardEvent;
}

// ============= STATE TRANSITIONS =============

export const CARD_TRANSITIONS: Transition[] = [
  { from: "hidden", to: "visible", event: "deal" },
  { from: "visible", to: "visible-colored", event: "reveal-colors" },
  { from: "visible-colored", to: "visible", event: "hide-colors" },
  { from: "visible", to: "visible-covered", event: "select" },
  { from: "visible-colored", to: "visible-covered", event: "select" },
  // Reset transitions
  { from: "visible-covered", to: "hidden", event: "reset" },
  { from: "visible", to: "hidden", event: "reset" },
  { from: "visible-colored", to: "hidden", event: "reset" },
];

// ============= PURE BUSINESS LOGIC =============

/**
 * Determines the next card state based on current state and event
 */
function determineNextCardState(
  currentState: CardDisplayState,
  event: CardEvent,
): CardDisplayState | null {
  const transition = CARD_TRANSITIONS.find((t) => t.from === currentState && t.event === event);
  return transition ? transition.to : null;
}

/**
 * Calculates the initial display state for a card based on view mode
 */
function calculateInitialDisplayState(
  card: Card,
  viewMode: ViewMode,
  isDealt: boolean = false,
): CardDisplayState {
  if (!isDealt) return "hidden"; // Cards start hidden until dealt
  if (card.selected) return "visible-covered";
  if (viewMode === "spymaster" && card.teamName) return "visible-colored";
  return "visible";
}

/**
 * Calculates transitions for all cards when toggling spymaster mode
 */
function calculateSpymasterTransitions(
  cards: Map<string, CardState>,
  newMode: ViewMode,
): Map<string, CardTransition> {
  const event = newMode === "spymaster" ? "reveal-colors" : "hide-colors";
  const transitions = new Map<string, CardTransition>();

  cards.forEach((card, word) => {
    if (card.displayState !== "visible-covered") {
      const nextState = determineNextCardState(card.displayState, event);
      if (nextState) {
        transitions.set(word, {
          fromState: card.displayState,
          toState: nextState,
          event,
        });
      }
    }
  });

  return transitions;
}

/**
 * Calculates transition for a single card selection
 */
function calculateSelectTransition(card: CardState): CardTransition | null {
  if (card.isTransitioning) return null;

  const nextState = determineNextCardState(card.displayState, "select");
  if (!nextState) return null;

  return {
    fromState: card.displayState,
    toState: nextState,
    event: "select",
  };
}

/**
 * Calculates transitions for dealing cards
 */
function calculateDealTransitions(
  cards: Map<string, CardState>,
  wordsToDeal: string[],
): Map<string, CardTransition> {
  const transitions = new Map<string, CardTransition>();

  wordsToDeal.forEach((word) => {
    const card = cards.get(word);
    if (card && card.displayState === "hidden") {
      const nextState = determineNextCardState(card.displayState, "deal");
      if (nextState) {
        transitions.set(word, {
          fromState: card.displayState,
          toState: nextState,
          event: "deal",
        });
      }
    }
  });

  return transitions;
}

/**
 * Calculates transitions for resetting all cards
 */
function calculateResetTransitions(cards: Map<string, CardState>): Map<string, CardTransition> {
  const transitions = new Map<string, CardTransition>();

  cards.forEach((card, word) => {
    if (card.displayState !== "hidden") {
      transitions.set(word, {
        fromState: card.displayState,
        toState: "hidden",
        event: "reset",
      });
    }
  });

  return transitions;
}

/**
 * Applies pending transitions to cards
 */
function applyPendingTransitions(
  cards: Map<string, CardState>,
  transitions: Map<string, CardTransition>,
): Map<string, CardState> {
  const newCards = new Map(cards);

  transitions.forEach((transition, word) => {
    const current = newCards.get(word) || {
      displayState: "hidden",
      isTransitioning: false,
    };

    newCards.set(word, {
      ...current,
      pendingState: transition.toState,
      isTransitioning: true,
    });
  });

  return newCards;
}

/**
 * Finalizes pending states after animations complete
 */
function finalizePendingStates(cards: Map<string, CardState>): Map<string, CardState> {
  const newCards = new Map<string, CardState>();

  cards.forEach((card, word) => {
    if (card.pendingState) {
      newCards.set(word, {
        displayState: card.pendingState,
        pendingState: undefined,
        isTransitioning: false,
      });
    } else {
      newCards.set(word, card);
    }
  });

  return newCards;
}

// ============= STORE WITH ACTIONS =============

interface CardVisibilityStore {
  // State
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  cardOrder: string[]; // Track card order for stagger animations

  // Actions
  initializeCard: (word: string, card: Card) => void;
  initializeCards: (gameCards: Card[]) => void;
  toggleSpymasterView: () => Promise<void>;
  selectCard: (word: string) => Promise<void>;
  dealCards: (words: string[]) => Promise<void>;
  resetCards: () => Promise<void>;
}

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  // State
  cards: new Map(),
  viewMode: "normal",
  cardOrder: [],

  // Actions
  initializeCard: (word, card) =>
    set((state) => {
      if (state.cards.has(word)) return state;

      const newCards = new Map(state.cards);

      // Always start hidden
      newCards.set(word, {
        displayState: "hidden",
        isTransitioning: false,
      });

      return {
        cards: newCards,
        cardOrder: [...state.cardOrder, word],
      };
    }),

  initializeCards: (gameCards) =>
    set((state) => {
      const newCards = new Map(state.cards);
      const newOrder: string[] = [];

      gameCards.forEach((card) => {
        if (!newCards.has(card.word)) {
          // Always start hidden
          newCards.set(card.word, {
            displayState: "hidden",
            isTransitioning: false,
          });
          newOrder.push(card.word);
        }
      });

      return {
        cards: newCards,
        cardOrder: [...state.cardOrder, ...newOrder],
      };
    }),

  toggleSpymasterView: async () => {
    const { cards, viewMode } = get();

    // Use pure function for business logic
    const newMode = viewMode === "normal" ? "spymaster" : "normal";
    const transitions = calculateSpymasterTransitions(cards, newMode);

    // Update state
    set({
      viewMode: newMode,
      cards: applyPendingTransitions(cards, transitions),
    });

    // Play animations with stagger
    const { cardOrder } = get();
    await boardAnimationEngine.playTransitions(transitions, (word) => cardOrder.indexOf(word));

    // Finalize
    set((state) => ({
      cards: finalizePendingStates(state.cards),
    }));
  },

  selectCard: async (word) => {
    const { cards } = get();
    const card = cards.get(word);
    if (!card) return;

    // Use pure function for business logic
    const transition = calculateSelectTransition(card);
    if (!transition) return;

    // Update state
    const transitions = new Map([[word, transition]]);
    set((state) => ({
      cards: applyPendingTransitions(state.cards, transitions),
    }));

    // Play animations
    await boardAnimationEngine.playTransitions(transitions);

    // Finalize
    set((state) => ({
      cards: finalizePendingStates(state.cards),
    }));
  },

  dealCards: async (words) => {
    console.log("🎴 dealCards called with:", words);
    const { cards } = get();

    // Initialize cards if needed
    const uninitializedWords = words.filter((word) => !cards.has(word));
    if (uninitializedWords.length > 0) {
      console.log("📝 Initializing new cards:", uninitializedWords);
      set((state) => {
        const newCards = new Map(state.cards);
        const newOrder = [...state.cardOrder];

        uninitializedWords.forEach((word) => {
          newCards.set(word, {
            displayState: "hidden",
            isTransitioning: false,
          });
          if (!newOrder.includes(word)) {
            newOrder.push(word);
          }
        });

        return { cards: newCards, cardOrder: newOrder };
      });
    }

    // Use pure function for business logic
    const updatedCards = get().cards; // Get after initialization
    const transitions = calculateDealTransitions(updatedCards, words);

    console.log("🎯 Calculated transitions:", transitions.size, "cards to animate");

    if (transitions.size === 0) {
      console.warn("⚠️ No transitions calculated - cards might already be dealt");
      return;
    }

    // Update state
    set((state) => ({
      cards: applyPendingTransitions(state.cards, transitions),
    }));

    // Play animations with stagger
    const { cardOrder } = get();
    await boardAnimationEngine.playTransitions(transitions, (word) => cardOrder.indexOf(word));

    // Finalize
    set((state) => ({
      cards: finalizePendingStates(state.cards),
    }));

    console.log("✅ Deal complete");
  },

  resetCards: async () => {
    const { cards } = get();

    // Calculate reset transitions
    const transitions = calculateResetTransitions(cards);

    // Update state
    set((state) => ({
      cards: applyPendingTransitions(state.cards, transitions),
      viewMode: "normal",
    }));

    // Play animations
    await boardAnimationEngine.playTransitions(transitions);

    // Finalize - clear everything
    set({
      cards: new Map(),
      cardOrder: [],
      viewMode: "normal",
    });
  },
}));

// ============= ANIMATION ENGINE =============

interface AnimationDefinition {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

interface AnimationEngine {
  register: (
    cardWord: string,
    elementId: string,
    element: HTMLElement,
    animations: Record<string, AnimationDefinition>,
  ) => void;
  unregister: (cardWord: string, elementId: string) => void;
  playTransitions: (
    transitions: Map<string, CardTransition>,
    getIndex?: (word: string) => number,
  ) => Promise<void>;
  cancelAll: () => void;
}

/**
 * Creates a board-wide animation engine using closure pattern
 */
function createBoardAnimationEngine(): AnimationEngine {
  // Nested structure for efficient lookup
  const registry = new Map<
    string,
    Map<string, { element: HTMLElement; animations: Record<string, AnimationDefinition> }>
  >();
  const activeAnimations = new Map<string, Animation>();

  const register = (
    cardWord: string,
    elementId: string,
    element: HTMLElement,
    animations: Record<string, AnimationDefinition>,
  ) => {
    if (!registry.has(cardWord)) {
      registry.set(cardWord, new Map());
    }
    registry.get(cardWord)!.set(elementId, { element, animations });
  };

  const unregister = (cardWord: string, elementId: string) => {
    const key = `${cardWord}-${elementId}`;
    activeAnimations.get(key)?.cancel();
    activeAnimations.delete(key);

    const cardRegistry = registry.get(cardWord);
    if (cardRegistry) {
      cardRegistry.delete(elementId);
      if (cardRegistry.size === 0) {
        registry.delete(cardWord);
      }
    }
  };

  const playTransitions = async (
    transitions: Map<string, CardTransition>,
    getIndex?: (word: string) => number,
  ): Promise<void> => {
    console.log("[AnimationEngine] Playing transitions for", transitions.size, "cards");
    const promises: Promise<void>[] = [];

    transitions.forEach((transition, cardWord) => {
      const cardElements = registry.get(cardWord);
      console.log(
        `[AnimationEngine] Card "${cardWord}" - event: ${transition.event}, elements:`,
        cardElements?.size || 0,
      );

      if (!cardElements) {
        console.warn(`[AnimationEngine] No elements registered for card: ${cardWord}`);
        return;
      }

      // Get index for stagger calculations
      const index = getIndex?.(cardWord) ?? 0;

      // Direct Map lookup - much more efficient!
      cardElements.forEach(({ element, animations }, elementId) => {
        const animDef = animations[transition.event];
        if (!animDef) {
          console.warn(`[AnimationEngine] No animation for ${transition.event} on ${elementId}`);
          return;
        }

        const key = `${cardWord}-${elementId}`;

        // Cancel existing animation
        activeAnimations.get(key)?.cancel();

        // Calculate stagger delay
        const staggerDelay = index * 50; // 50ms per card
        const options = {
          ...animDef.options,
          delay: (animDef.options.delay ?? 0) + staggerDelay,
        };

        console.log(`[AnimationEngine] Starting animation for ${key}`, {
          keyframes: animDef.keyframes,
          options,
        });

        const animation = element.animate(animDef.keyframes, options);
        activeAnimations.set(key, animation);

        // Create a proper void promise
        const animationPromise: Promise<void> = animation.finished.then(
          () => {
            activeAnimations.delete(key);
            console.log(`[AnimationEngine] Animation complete for ${key}`);
          },
          (error) => {
            // Animation was cancelled, which is ok
            // We still need to clean up
            activeAnimations.delete(key);
            console.log(`[AnimationEngine] Animation cancelled for ${key}`);
          },
        );

        promises.push(animationPromise);
      });
    });

    await Promise.all(promises);
    console.log("[AnimationEngine] All animations complete");
  };

  const cancelAll = () => {
    activeAnimations.forEach((anim) => anim.cancel());
    activeAnimations.clear();
  };

  return { register, unregister, playTransitions, cancelAll };
}

// Single instance for the board
export const boardAnimationEngine = createBoardAnimationEngine();

// ============= UNIFIED CARD VISIBILITY HOOK =============

export function useCardVisibility(card: Card, index: number) {
  // State
  const cardState = useCardVisibilityStore((state) => state.cards.get(card.word));
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const initializeCard = useCardVisibilityStore((state) => state.initializeCard);
  const selectCard = useCardVisibilityStore((state) => state.selectCard);

  // Initialize card if not in store
  useEffect(() => {
    if (!cardState) {
      initializeCard(card.word, card);
    }
  }, [card.word, cardState, initializeCard, card]);

  // Animation registration
  const createAnimationRef = useCallback(
    (elementId: string, animations: Record<string, AnimationDefinition>) => {
      return (element: HTMLElement | null) => {
        if (element) {
          boardAnimationEngine.register(card.word, elementId, element, animations);
        } else {
          boardAnimationEngine.unregister(card.word, elementId);
        }
      };
    },
    [card.word],
  );

  return {
    // State
    displayState: cardState?.displayState || "hidden",
    isPending: cardState?.isTransitioning || false,
    viewMode,

    // Actions
    select: () => selectCard(card.word),

    // Animation refs
    createAnimationRef,
  };
}

// ============= ANIMATION DEFINITIONS =============

/**
 * Animation definitions for card elements
 * Keys match event names (standardized with dashes)
 */
export const CARD_ANIMATIONS = {
  container: {
    deal: {
      keyframes: [
        {
          opacity: "0",
          transform: "translateY(-100px) rotate(-15deg) scale(0.5)", // More dramatic start
          offset: 0,
        },
        {
          opacity: "0.5",
          transform: "translateY(-30px) rotate(-5deg) scale(0.8)", // Mid-point
          offset: 0.5,
        },
        {
          opacity: "1",
          transform: "translateY(0) rotate(0deg) scale(1)", // Final
          offset: 1,
        },
      ],
      options: {
        duration: 600,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "both" as FillMode, // Changed from "forwards" to "both"
      },
    },
    select: {
      keyframes: [
        { transform: "scale(1)" },
        { transform: "scale(0.95)" },
        { transform: "scale(1)" },
      ],
      options: {
        duration: 300,
        easing: "ease-in-out",
      },
    },
    reset: {
      keyframes: [
        { opacity: "1", transform: "scale(1)" },
        { opacity: "0", transform: "scale(0.8) translateY(-20px)" },
      ],
      options: {
        duration: 300,
        easing: "ease-out",
        fill: "forwards" as FillMode,
      },
    },
  },

  word: {
    deal: {
      keyframes: [{ opacity: "0" }, { opacity: "1" }],
      options: {
        duration: 300,
        delay: 200,
      },
    },
    "reveal-colors": {
      keyframes: [
        {
          transform: "scale(1)",
          filter: "brightness(1)",
        },
        {
          transform: "scale(1.05)",
          filter: "brightness(1.1)",
        },
        {
          transform: "scale(1)",
          filter: "brightness(1)",
        },
      ],
      options: {
        duration: 400,
        easing: "ease-in-out",
      },
    },
    "hide-colors": {
      keyframes: [
        {
          transform: "scale(1)",
          filter: "brightness(1)",
        },
        {
          transform: "scale(0.95)",
          filter: "brightness(0.9)",
        },
        {
          transform: "scale(1)",
          filter: "brightness(1)",
        },
      ],
      options: {
        duration: 300,
      },
    },
    select: {
      keyframes: [
        { transform: "scale(1)" },
        { transform: "scale(1.1)" },
        { transform: "scale(0)" },
      ],
      options: {
        duration: 400,
        easing: "ease-in",
      },
    },
  },

  badge: {
    "reveal-colors": {
      keyframes: [
        {
          opacity: "0",
          transform: "scale(0.5) translateY(10px)",
        },
        {
          opacity: "1",
          transform: "scale(1.1) translateY(0)",
        },
        {
          opacity: "1",
          transform: "scale(1) translateY(0)",
        },
      ],
      options: {
        duration: 400,
        delay: 100,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "forwards" as FillMode,
      },
    },
    "hide-colors": {
      keyframes: [
        { opacity: "1", transform: "scale(1)" },
        { opacity: "0", transform: "scale(0.8)" },
      ],
      options: {
        duration: 200,
        fill: "forwards" as FillMode,
      },
    },
  },

  cover: {
    select: {
      keyframes: [
        { transform: "rotateY(-180deg) scale(0)" },
        { transform: "rotateY(-90deg) scale(0.5)" },
        { transform: "rotateY(0deg) scale(1)" },
      ],
      options: {
        duration: 600,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "forwards" as FillMode,
      },
    },
  },

  cardInner: {
    select: {
      keyframes: [{ transform: "rotateY(0deg)" }, { transform: "rotateY(180deg)" }],
      options: {
        duration: 600,
        easing: "ease-in-out",
        fill: "forwards" as FillMode,
      },
    },
  },

  // Special animations for assassin cards
  assassin: {
    select: {
      keyframes: [
        {
          filter: "brightness(1) saturate(1)",
          transform: "scale(1)",
        },
        {
          filter: "brightness(2) saturate(0)",
          transform: "scale(1.1)",
        },
        {
          filter: "brightness(0.5) saturate(2)",
          transform: "scale(0.95)",
        },
        {
          filter: "brightness(1) saturate(1)",
          transform: "scale(1)",
        },
      ],
      options: {
        duration: 1000,
        easing: "ease-in-out",
      },
    },
    "reveal-colors": {
      keyframes: [
        {
          filter: "brightness(1)",
          boxShadow: "0 0 0 transparent",
        },
        {
          filter: "brightness(1.5)",
          boxShadow: "0 0 30px rgba(255, 0, 0, 0.8), inset 0 0 20px rgba(255, 0, 0, 0.4)",
        },
      ],
      options: {
        duration: 600,
        fill: "forwards" as FillMode,
      },
    },
  },
};
