import React, { useCallback, useEffect, useRef } from "react";
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
  { from: "visible-covered", to: "hidden", event: "reset" },
  { from: "visible", to: "hidden", event: "reset" },
  { from: "visible-colored", to: "hidden", event: "reset" },
];

// ============= PURE BUSINESS LOGIC - DRY =============

function determineNextCardState(
  currentState: CardDisplayState,
  event: CardEvent,
): CardDisplayState | null {
  const transition = CARD_TRANSITIONS.find((t) => t.from === currentState && t.event === event);
  return transition ? transition.to : null;
}

/**
 * Calculate transition for a single card
 */
function calculateCardTransition(card: CardState, event: CardEvent): CardTransition | null {
  if (card.isTransitioning) return null;

  const nextState = determineNextCardState(card.displayState, event);
  if (!nextState) return null;

  return {
    fromState: card.displayState,
    toState: nextState,
    event,
  };
}

/**
 * Calculate transitions for multiple cards
 */
function calculateTransitions(
  cards: Map<string, CardState>,
  event: CardEvent,
  targetWords?: string[],
): Map<string, CardTransition> {
  const transitions = new Map<string, CardTransition>();

  const wordsToProcess = targetWords || Array.from(cards.keys());

  wordsToProcess.forEach((word) => {
    const card = cards.get(word);
    if (!card) return;

    const transition = calculateCardTransition(card, event);
    if (transition) {
      transitions.set(word, transition);
    }
  });

  return transitions;
}

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

// ============= STORE =============

interface CardVisibilityStore {
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  cardOrder: string[];

  initializeCard: (word: string, card: Card) => void;
  initializeCards: (gameCards: Card[]) => void;
  toggleSpymasterView: () => Promise<void>;
  selectCard: (word: string) => Promise<void>;
  dealCards: (words: string[]) => Promise<void>;
  resetCards: () => Promise<void>;
}

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => {
  /**
   * Generic transition executor
   */
  const executeTransitions = async (
    transitions: Map<string, CardTransition>,
    useStagger: boolean = false,
  ) => {
    if (transitions.size === 0) return;

    set((state) => ({
      cards: applyPendingTransitions(state.cards, transitions),
    }));

    const { cardOrder } = get();

    await boardAnimationEngine.playTransitions(
      transitions,
      useStagger ? (word) => cardOrder.indexOf(word) : undefined,
    );

    set((state) => ({
      cards: finalizePendingStates(state.cards),
    }));
  };

  /**
   * Ensure cards are initialized before operating on them
   */
  const ensureCardsInitialized = (words: string[]) => {
    const { cards } = get();
    const uninitializedWords = words.filter((word) => !cards.has(word));

    if (uninitializedWords.length > 0) {
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
  };

  return {
    cards: new Map(),
    viewMode: "normal",
    cardOrder: [],

    initializeCard: (word, card) =>
      set((state) => {
        if (state.cards.has(word)) return state;

        const newCards = new Map(state.cards);
        newCards.set(word, {
          displayState: "hidden",
          isTransitioning: false,
        });

        return {
          cards: newCards,
          cardOrder: [...state.cardOrder, word],
        };
      }),

    initializeCards: (gameCards) => {
      ensureCardsInitialized(gameCards.map((c) => c.word));
    },

    toggleSpymasterView: async () => {
      const { cards, viewMode } = get();

      const newMode = viewMode === "normal" ? "spymaster" : "normal";
      const event = newMode === "spymaster" ? "reveal-colors" : "hide-colors";

      set({ viewMode: newMode });

      const transitions = calculateTransitions(cards, event);
      await executeTransitions(transitions, true);
    },

    selectCard: async (word) => {
      const { cards } = get();
      const card = cards.get(word);
      if (!card) return;

      const transition = calculateCardTransition(card, "select");
      if (!transition) return;

      await executeTransitions(new Map([[word, transition]]));
    },

    dealCards: async (words) => {
      ensureCardsInitialized(words);

      const { cards } = get();
      const transitions = calculateTransitions(cards, "deal", words);


      if (transitions.size === 0) {
        return;
      }

      await executeTransitions(transitions, true);
    },

    resetCards: async () => {
      const { cards } = get();
      const transitions = calculateTransitions(cards, "reset");

      await executeTransitions(transitions);

      set({
        cards: new Map(),
        cardOrder: [],
        viewMode: "normal",
      });
    },
  };
});

// ============= ANIMATION ENGINE (unchanged) =============

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

function createBoardAnimationEngine(): AnimationEngine {
  const registry = new Map<
    string,
    Map<string, { element: HTMLElement; animations: Record<string, AnimationDefinition> }>
  >();

  const runningAnimations = new Map<string, Animation>();

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
    const promises: Promise<void>[] = [];

    transitions.forEach((transition, cardWord) => {
      const cardElements = registry.get(cardWord);

      if (!cardElements) {
        console.warn(`[AnimationEngine] No elements registered for card: ${cardWord}`);
        return;
      }

      const index = getIndex?.(cardWord) ?? 0;

      cardElements.forEach(({ element, animations }, elementId) => {
        const animDef = animations[transition.event];
        if (!animDef) {
          console.warn(`[AnimationEngine] No animation for ${transition.event} on ${elementId}`);
          return;
        }

        const animKey = `${cardWord}-${elementId}-${transition.event}`;
        const existing = runningAnimations.get(animKey);

        if (existing && existing.playState === "running") {
          return;
        }

        const staggerDelay = index * 50;
        const options = {
          ...animDef.options,
          delay: (animDef.options.delay ?? 0) + staggerDelay,
        };


        const animation = element.animate(animDef.keyframes, options);
        runningAnimations.set(animKey, animation);

        const animationPromise: Promise<void> = animation.finished.then(
          () => {
            runningAnimations.delete(animKey);
          },
          (error) => {
            runningAnimations.delete(animKey);
          },
        );

        promises.push(animationPromise);
      });
    });

    await Promise.all(promises);
  };

  const cancelAll = () => {
    runningAnimations.forEach((anim) => anim.cancel());
    runningAnimations.clear();
  };

  return { register, unregister, playTransitions, cancelAll };
}

export const boardAnimationEngine = createBoardAnimationEngine();

// ============= UNIFIED CARD VISIBILITY HOOK (unchanged) =============

export function useCardVisibility(card: Card, index: number) {
  const cardState = useCardVisibilityStore((state) => state.cards.get(card.word));
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const initializeCard = useCardVisibilityStore((state) => state.initializeCard);
  const selectCard = useCardVisibilityStore((state) => state.selectCard);

  const animationRefCallbacks = useRef<Map<string, (element: HTMLElement | null) => void>>(
    new Map(),
  );

  useEffect(() => {
    if (!cardState) {
      initializeCard(card.word, card);
    }
  }, [card.word, cardState, initializeCard, card]);

  const createAnimationRef = useCallback(
    (elementId: string, animations: Record<string, AnimationDefinition>) => {
      let ref = animationRefCallbacks.current.get(elementId);
      if (ref) return ref;

      ref = (element: HTMLElement | null) => {
        if (element) {
          boardAnimationEngine.register(card.word, elementId, element, animations);
        } else {
          boardAnimationEngine.unregister(card.word, elementId);
        }
      };

      animationRefCallbacks.current.set(elementId, ref);
      return ref;
    },
    [card.word],
  );

  useEffect(() => {
    return () => {
      animationRefCallbacks.current.clear();
    };
  }, [card.word]);

  return {
    displayState: cardState?.displayState || "hidden",
    isPending: cardState?.isTransitioning || false,
    viewMode,
    select: () => selectCard(card.word),
    createAnimationRef,
  };
}
