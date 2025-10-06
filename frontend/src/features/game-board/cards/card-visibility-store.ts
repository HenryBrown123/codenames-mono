import { create } from "zustand";
import { cardAnimationEngine } from "./card-animations";

/**
 * Card visual display states
 * Independent from game state (e.g., card can be "visible" in game but "hidden" visually during deal animation)
 */
export type CardDisplayState = "hidden" | "visible" | "visible-colored" | "visible-covered";

/**
 * View mode determines whether team colors are shown
 */
export type ViewMode = "normal" | "spymaster";

/**
 * Card events that trigger state transitions and animations
 * These map directly to store actions
 */
export type CardEvent =
  | "animate-deal"
  | "reveal-colors"
  | "hide-colors"
  | "reveal-card"
  | "reset";

/**
 * Per-card state tracking
 */
export interface CardState {
  displayState: CardDisplayState;
  pendingState?: CardDisplayState;
  isTransitioning: boolean;
}

/**
 * Card transition definition
 */
export interface CardTransition {
  fromState: CardDisplayState;
  toState: CardDisplayState;
  event: CardEvent;
}

/**
 * State machine definition
 * Defines all valid state transitions and their trigger events
 */
const CARD_TRANSITIONS: Array<{
  from: CardDisplayState;
  to: CardDisplayState;
  event: CardEvent;
}> = [
  { from: "hidden", to: "visible", event: "animate-deal" },
  { from: "visible", to: "visible-colored", event: "reveal-colors" },
  { from: "visible-colored", to: "visible", event: "hide-colors" },
  { from: "visible", to: "visible-covered", event: "reveal-card" },
  { from: "visible-colored", to: "visible-covered", event: "reveal-card" },
  { from: "visible-covered", to: "hidden", event: "reset" },
  { from: "visible", to: "hidden", event: "reset" },
  { from: "visible-colored", to: "hidden", event: "reset" },
];

/**
 * Determine next state based on current state and event
 * Pure function - no side effects
 * @returns Next state or null if transition is invalid
 */
function determineNextCardState(
  currentState: CardDisplayState,
  event: CardEvent
): CardDisplayState | null {
  const transition = CARD_TRANSITIONS.find((t) => t.from === currentState && t.event === event);
  return transition ? transition.to : null;
}

/**
 * Calculate transition for a single card
 * Returns null if card is already transitioning or transition is invalid
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
 * @param cards - Current card state map
 * @param event - Event to trigger
 * @param targetWords - Optional subset of words to transition (e.g., for single card reveal)
 */
function calculateTransitions(
  cards: Map<string, CardState>,
  event: CardEvent,
  targetWords?: string[]
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

/**
 * Apply pending states to cards (marks them as transitioning)
 */
function applyPendingTransitions(
  cards: Map<string, CardState>,
  transitions: Map<string, CardTransition>
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
 * Finalize transitions (moves pendingState to displayState)
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

interface CardVisibilityStore {
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  cardOrder: string[];

  initializeCard: (word: string) => void;
  initializeCards: (words: string[]) => void;
  toggleSpymasterView: () => Promise<void>;
  revealCard: (word: string) => Promise<void>;
  animateDeal: (words: string[]) => Promise<void>;
  resetCards: () => Promise<void>;
}

export const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => {
  /**
   * Generic transition executor
   * 1. Marks cards as transitioning (sets pendingState)
   * 2. Executes WAAPI animations via engine
   * 3. Finalizes states (moves pendingState to displayState)
   *
   * @param transitions - Map of card words to transitions
   * @param useStagger - Whether to stagger animations (for dealing)
   */
  const executeTransitions = async (
    transitions: Map<string, CardTransition>,
    useStagger: boolean = false
  ) => {
    if (transitions.size === 0) return;

    set((state) => ({
      cards: applyPendingTransitions(state.cards, transitions),
    }));

    const { cardOrder } = get();
    await cardAnimationEngine.playTransitions(
      transitions,
      useStagger ? (word: string) => cardOrder.indexOf(word) : undefined
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

    initializeCards: (words) => {
      ensureCardsInitialized(words);
    },

    toggleSpymasterView: async () => {
      const { cards, viewMode } = get();

      const newMode = viewMode === "normal" ? "spymaster" : "normal";
      const event = newMode === "spymaster" ? "reveal-colors" : "hide-colors";

      set({ viewMode: newMode });

      const transitions = calculateTransitions(cards, event);
      await executeTransitions(transitions, true);
    },

    revealCard: async (word) => {
      const { cards } = get();
      const card = cards.get(word);
      if (!card) return;

      const transition = calculateCardTransition(card, "reveal-card");
      if (!transition) return;

      await executeTransitions(new Map([[word, transition]]));
    },

    animateDeal: async (words) => {
      ensureCardsInitialized(words);

      const { cards } = get();
      const transitions = calculateTransitions(cards, "animate-deal", words);

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
