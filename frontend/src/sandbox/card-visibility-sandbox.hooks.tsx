import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { create } from "zustand";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";

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
  dealRequested: boolean;
  selectRequested: boolean;

  initializeCard: (word: string, card: Card) => void;
  initializeCards: (gameCards: Card[]) => void;
  toggleSpymasterView: (engine: any) => Promise<void>;
  selectCard: (word: string, engine: any) => Promise<void>;
  dealCards: (words: string[], engine: any) => Promise<void>;
  resetCards: (engine: any) => Promise<void>;
  requestDeal: () => void;
  requestSelect: () => void;
  clearDealRequest: () => void;
  clearSelectRequest: () => void;
}

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => {
  /**
   * Generic transition executor
   */
  const executeTransitions = async (
    transitions: Map<string, CardTransition>,
    useStagger: boolean = false,
    engine: any,
  ) => {
    if (transitions.size === 0) return;

    set((state) => ({
      cards: applyPendingTransitions(state.cards, transitions),
    }));

    const { cardOrder } = get();

    // Convert to format expected by real animation engine
    const animationTransitions = new Map();
    transitions.forEach((transition, word) => {
      animationTransitions.set(word, { event: transition.event });
    });

    await engine.playTransitions(
      animationTransitions,
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
    dealRequested: false,
    selectRequested: false,

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

    toggleSpymasterView: async (engine) => {
      const { cards, viewMode } = get();

      const newMode = viewMode === "normal" ? "spymaster" : "normal";
      const event = newMode === "spymaster" ? "reveal-colors" : "hide-colors";

      set({ viewMode: newMode });

      const transitions = calculateTransitions(cards, event);
      await executeTransitions(transitions, true, engine);
    },

    selectCard: async (word, engine) => {
      const { cards } = get();
      const card = cards.get(word);
      if (!card) return;

      const transition = calculateCardTransition(card, "select");
      if (!transition) return;

      await executeTransitions(new Map([[word, transition]]), false, engine);
    },

    dealCards: async (words, engine) => {
      ensureCardsInitialized(words);

      const { cards } = get();
      const transitions = calculateTransitions(cards, "deal", words);

      if (transitions.size === 0) {
        return;
      }

      await executeTransitions(transitions, true, engine);
    },

    resetCards: async (engine) => {
      const { cards } = get();
      const transitions = calculateTransitions(cards, "reset");

      await executeTransitions(transitions, false, engine);

      set({
        cards: new Map(),
        cardOrder: [],
        viewMode: "normal",
      });
    },

    requestDeal: () => set({ dealRequested: true }),
    requestSelect: () => set({ selectRequested: true }),
    clearDealRequest: () => set({ dealRequested: false }),
    clearSelectRequest: () => set({ selectRequested: false }),
  };
});

// ============= UNIFIED CARD VISIBILITY HOOK =============

export function useCardVisibility(card: Card, index: number) {
  const cardState = useCardVisibilityStore((state) => state.cards.get(card.word));
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const initializeCard = useCardVisibilityStore((state) => state.initializeCard);
  const selectCard = useCardVisibilityStore((state) => state.selectCard);

  // Build entity context for the real animation engine
  const entityContext = useMemo(
    () => ({
      word: card.word,
      teamName: card.teamName,
      selected: card.selected,
      index,
      displayState: cardState?.displayState || "hidden",
      isTransitioning: cardState?.isTransitioning || false,
      pendingState: cardState?.pendingState,
      viewMode,
    }),
    [
      card.word,
      card.teamName,
      card.selected,
      index,
      cardState?.displayState,
      cardState?.isTransitioning,
      cardState?.pendingState,
      viewMode,
    ],
  );

  // Use the real animation registration hook
  const { createAnimationRef } = useAnimationRegistration(card.word, entityContext);

  useEffect(() => {
    if (!cardState) {
      initializeCard(card.word, card);
    }
  }, [card.word, cardState, initializeCard, card]);

  return {
    displayState: cardState?.displayState || "hidden",
    isPending: cardState?.isTransitioning || false,
    viewMode,
    select: () => selectCard(card.word),
    createAnimationRef,
  };
}
