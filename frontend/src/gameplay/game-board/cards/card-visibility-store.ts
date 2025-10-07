import { create } from "zustand";
import { Card } from "@frontend/shared-types";
import type { AnimationTransition } from "../../animations/animation-types";
import { createWebAnimationEngine } from "@frontend/gameplay/animations";

import {
  DisplayState,
  ViewMode,
  CardEvent,
  CardState,
  CardTransition,
  CARD_TRANSITIONS,
} from "./card-visibility-types";

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

function determineNextCardState(current: DisplayState, event: CardEvent): DisplayState | null {
  const transition = CARD_TRANSITIONS.find((t) => t.from === current && t.event === event);
  return transition ? transition.to : null;
}

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
      displayState: "hidden" as DisplayState,
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

const boardAnimationEngine = createWebAnimationEngine();

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => {
  const executeTransitions = async (
    transitions: Map<string, CardTransition>,
    useStagger: boolean = false,
  ) => {
    if (transitions.size === 0) return;

    set((state) => ({
      cards: applyPendingTransitions(state.cards, transitions),
    }));

    const { cardOrder } = get();

    const animationTransitions = new Map<string, AnimationTransition>();
    transitions.forEach((transition, word) => {
      animationTransitions.set(word, { event: transition.event });
    });

    await boardAnimationEngine.playTransitions(
      animationTransitions,
      useStagger ? (word) => cardOrder.indexOf(word) : undefined,
    );

    set((state) => ({
      cards: finalizePendingStates(state.cards),
    }));
  };

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
