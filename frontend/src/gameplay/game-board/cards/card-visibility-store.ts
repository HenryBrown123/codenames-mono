import { create } from "zustand";
import { Card } from "@frontend/shared-types";
import type { WebAnimationEngine } from "../../animations/web-animation-engine";
import type { AnimationTransition } from "../../animations/animation-types";
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
  uninitializeCard: (word: string) => void;
  initializeCards: (gameCards: Card[]) => void;
  toggleSpymasterView: (engine: WebAnimationEngine) => Promise<void>;
  selectCard: (word: string, engine: WebAnimationEngine) => Promise<void>;
  dealCards: (words: string[], engine: WebAnimationEngine) => Promise<void>;
  resetCards: (engine: WebAnimationEngine) => Promise<void>;
}

function determineNextCardState(current: DisplayState, event: CardEvent): DisplayState | null {
  const transition = CARD_TRANSITIONS.find((t) => t.from === current && t.event === event);
  return transition ? transition.to : null;
}

function calculateCardTransition(card: CardState, event: CardEvent): CardTransition | null {
  // if (card.isTransitioning) return null;

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

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => {
  const executeTransitions = async (
    engine: WebAnimationEngine,
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

    await engine.playTransitions(
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
        const newOrder: string[] = [];

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

    initializeCard: (word) =>
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

    uninitializeCard: (word) =>
      set((state) => {
        const newCards = new Map(state.cards);
        newCards.delete(word);

        return {
          cards: newCards,
          cardOrder: state.cardOrder.filter((w) => w !== word),
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
      await executeTransitions(engine, transitions, true);
    },

    selectCard: async (word, engine) => {
      const { cards } = get();
      const card = cards.get(word);
      if (!card) return;

      const transition = calculateCardTransition(card, "select");
      if (!transition) return;

      await executeTransitions(engine, new Map([[word, transition]]));
    },

    dealCards: async (words, engine) => {
      console.log("[Store] dealCards called", { words });

      ensureCardsInitialized(words);

      const { cards } = get();
      console.log(
        "[Store] Current card states:",
        Array.from(cards.entries()).map(([word, state]) => ({ word, ...state })),
      );

      const transitions = calculateTransitions(cards, "deal", words);
      console.log(
        "[Store] Calculated transitions:",
        transitions.size,
        Array.from(transitions.entries()),
      );

      if (transitions.size === 0) {
        console.warn("[Store] No transitions calculated!");
        return;
      }

      console.log("[Store] About to execute transitions");
      await executeTransitions(engine, transitions, true);
      console.log("[Store] Transitions complete");
    },

    resetCards: async (engine) => {
      const { cards } = get();
      const transitions = calculateTransitions(cards, "reset");

      await executeTransitions(engine, transitions);

      set({
        cards: new Map(),
        cardOrder: [],
        viewMode: "normal",
      });
    },
  };
});
