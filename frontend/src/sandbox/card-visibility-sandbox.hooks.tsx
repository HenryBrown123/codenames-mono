import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";
import { useAnimationEngine } from "../gameplay/animations/animation-engine-context";

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
      useStagger ? (word: string) => cardOrder.indexOf(word) : undefined,
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

    initializeCard: (word, _card) =>
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
  const engine = useAnimationEngine();

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
    select: () => selectCard(card.word, engine),
    createAnimationRef,
  };
}

// ============= SANDBOX STORE (NEW - ADD TO END OF FILE) =============

import { usePendingAnimations } from '../gameplay/animations/use-pending-animations';

type SandboxDisplayState = 'hidden' | 'visible' | 'covered';
type SandboxEvent = 'deal' | 'select' | 'reset';

interface SandboxCardState {
  word: string;
  teamName: string;
  selected: boolean;
  displayState: SandboxDisplayState;
  isTransitioning: boolean;
}

interface SandboxTransition {
  entityId: string;
  fromState: SandboxDisplayState;
  toState: SandboxDisplayState;
  animationType: string;
}

interface SandboxStore {
  card: SandboxCardState | null;
  pendingTransitions: Map<string, SandboxTransition>;

  initializeCard: (word: string, teamName: string) => void;
  dealCard: () => void;
  selectCard: () => void;
  resetCard: () => void;

  commitTransitions: (entityIds: string[]) => void;
}

function determineNextSandboxState(
  current: SandboxDisplayState,
  event: SandboxEvent
): SandboxDisplayState | null {
  const transitions: Record<SandboxDisplayState, Partial<Record<SandboxEvent, SandboxDisplayState>>> = {
    'hidden': {
      'deal': 'visible',
      'reset': 'hidden',
    },
    'visible': {
      'select': 'covered',
      'reset': 'hidden',
    },
    'covered': {
      'reset': 'hidden',
    },
  };

  return transitions[current]?.[event] ?? null;
}

function calculateSandboxTransition(
  card: SandboxCardState,
  event: SandboxEvent
): SandboxTransition | null {
  if (card.isTransitioning) return null;

  const nextState = determineNextSandboxState(card.displayState, event);
  if (!nextState) return null;

  return {
    entityId: card.word,
    fromState: card.displayState,
    toState: nextState,
    animationType: event,
  };
}

export const useSandboxStore = create<SandboxStore>((set) => ({
  card: null,
  pendingTransitions: new Map(),

  initializeCard: (word, teamName) => {
    set({
      card: {
        word,
        teamName,
        selected: false,
        displayState: 'hidden',
        isTransitioning: false,
      },
      pendingTransitions: new Map(),
    });
  },

  dealCard: () => {
    set(state => {
      if (!state.card) return state;

      const transition = calculateSandboxTransition(state.card, 'deal');
      if (!transition) return state;

      return {
        card: {
          ...state.card,
          isTransitioning: true,
        },
        pendingTransitions: new Map([[state.card.word, transition]]),
      };
    });
  },

  selectCard: () => {
    set(state => {
      if (!state.card) return state;

      const transition = calculateSandboxTransition(state.card, 'select');
      if (!transition) return state;

      return {
        card: {
          ...state.card,
          isTransitioning: true,
        },
        pendingTransitions: new Map([[state.card.word, transition]]),
      };
    });
  },

  resetCard: () => {
    set(state => {
      if (!state.card) return state;

      const transition = calculateSandboxTransition(state.card, 'reset');
      if (!transition) return state;

      return {
        card: {
          ...state.card,
          isTransitioning: true,
        },
        pendingTransitions: new Map([[state.card.word, transition]]),
      };
    });
  },

  commitTransitions: (_entityIds) => {
    set(state => {
      if (!state.card) return state;

      const transition = state.pendingTransitions.get(state.card.word);
      if (!transition) return state;

      return {
        card: {
          ...state.card,
          displayState: transition.toState,
          isTransitioning: false,
          selected: transition.toState === 'covered' ? true : state.card.selected,
        },
        pendingTransitions: new Map(),
      };
    });
  },
}));

export function useSandboxCoordinator() {
  const pendingTransitions = useSandboxStore(state => state.pendingTransitions);
  const commitTransitions = useSandboxStore(state => state.commitTransitions);

  usePendingAnimations(
    pendingTransitions,
    commitTransitions,
    undefined,
  );
}

export function useSandboxCardVisibility() {
  const card = useSandboxStore(state => state.card);

  const entityContext = useMemo(
    () => ({
      word: card?.word || '',
      teamName: card?.teamName || '',
      selected: card?.selected || false,
      displayState: card?.displayState || 'hidden',
      isTransitioning: card?.isTransitioning || false,
    }),
    [
      card?.word,
      card?.teamName,
      card?.selected,
      card?.displayState,
      card?.isTransitioning,
    ],
  );

  const { createAnimationRef } = useAnimationRegistration(card?.word || '', entityContext);

  return {
    card,
    displayState: card?.displayState || 'hidden',
    isTransitioning: card?.isTransitioning || false,
    createAnimationRef,
  };
}

// ============= ANIMATION COORDINATOR =============

/**
 * Coordinates animations by consuming pending transitions from the store
 * and invoking the animation engine, then committing state changes.
 *
 * This hook bridges the gap between:
 * - Zustand store (business logic & state)
 * - Animation engine (visual execution)
 *
 * Flow:
 * 1. Store action queues transitions (e.g., dealCard())
 * 2. This hook detects pendingTransitions via usePendingAnimations
 * 3. Animation engine plays transitions
 * 4. When complete, commitTransitions() updates displayState
 */
export function useAnimationCoordinator() {
  const pendingTransitions = useCardVisibilityStore(state => {
    const transitions = new Map<string, { animationType: string }>();
    state.cards.forEach((card, word) => {
      if (card.isTransitioning && card.pendingState) {
        // Map the event to animationType for the animation engine
        const event = determineEventFromTransition(card.displayState, card.pendingState);
        transitions.set(word, {
          animationType: event,
        });
      }
    });
    return transitions;
  });

  const commitTransitions = useCardVisibilityStore(state => {
    return (entityIds: string[]) => {
      // Finalize the pending states for the given entity IDs
      const newCards = new Map(state.cards);
      let hasChanges = false;

      entityIds.forEach(word => {
        const card = newCards.get(word);
        if (card?.pendingState) {
          newCards.set(word, {
            displayState: card.pendingState,
            pendingState: undefined,
            isTransitioning: false,
          });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        useCardVisibilityStore.setState({ cards: newCards });
      }
    };
  });

  usePendingAnimations(
    pendingTransitions,
    commitTransitions,
    undefined,
  );
}

// Helper to determine event from state transition
function determineEventFromTransition(
  fromState: CardDisplayState,
  toState: CardDisplayState
): CardEvent {
  // Look up the event in the transition table
  const transition = CARD_TRANSITIONS.find(
    t => t.from === fromState && t.to === toState
  );
  return transition?.event || 'deal';
}

// ============= COMPREHENSIVE ORCHESTRATOR =============

/**
 * Full-lifecycle orchestrator for card visibility system.
 *
 * Architecture:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    ORCHESTRATOR LAYER                       │
 * │  useCardVisibilityOrchestrator()                           │
 * │  - Manages initialization, transitions, cleanup            │
 * │  - Provides high-level API (dealCards, selectCard, etc.)   │
 * └─────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    STATE LAYER                              │
 * │  useCardVisibilityStore (Zustand)                          │
 * │  - Business logic & state transitions                       │
 * │  - Calculates valid transitions                            │
 * │  - Queues pending transitions                              │
 * └─────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    ANIMATION LAYER                          │
 * │  useAnimationCoordinator()                                 │
 * │  - Detects pending transitions                             │
 * │  - Triggers animation engine                               │
 * │  - Commits state when animations complete                  │
 * └─────────────────────────────────────────────────────────────┘
 *                           ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    RENDERING LAYER                          │
 * │  useCardVisibility()                                       │
 * │  - Per-card hook for components                            │
 * │  - Registers elements with animation engine                │
 * │  - Provides displayState and animation refs                │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Usage:
 *
 * function MyScene() {
 *   const {
 *     dealCards,
 *     selectCard,
 *     toggleSpymaster,
 *     resetCards,
 *   } = useCardVisibilityOrchestrator();
 *
 *   return (
 *     <>
 *       <button onClick={() => dealCards(['ROBOT', 'PIANO'])}>
 *         Deal Cards
 *       </button>
 *       {gameCards.map((card, i) => (
 *         <GameCard key={card.word} card={card} index={i} />
 *       ))}
 *     </>
 *   );
 * }
 *
 * Benefits:
 * - Single source of truth (Zustand store)
 * - Declarative state machine
 * - Automatic animation coordination
 * - Type-safe transitions
 * - Easy to test (pure functions)
 * - Clean separation of concerns
 */
export function useCardVisibilityOrchestrator() {
  const engine = useAnimationEngine();
  const store = useCardVisibilityStore();

  // Coordinate animations
  useAnimationCoordinator();

  return {
    // State accessors
    cards: store.cards,
    viewMode: store.viewMode,
    cardOrder: store.cardOrder,

    // Lifecycle methods
    initializeCard: store.initializeCard,
    initializeCards: store.initializeCards,

    // Actions (auto-animated)
    dealCards: (words: string[]) => store.dealCards(words, engine),
    selectCard: (word: string) => store.selectCard(word, engine),
    toggleSpymasterView: () => store.toggleSpymasterView(engine),
    resetCards: () => store.resetCards(engine),
  };
}
