import { useCallback, useMemo } from "react";
import { create } from "zustand";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";
import { usePendingAnimations } from "../gameplay/animations/use-pending-animations";

// ============= TYPES =============

type SandboxDisplayState = "hidden" | "visible" | "covered" | "visible-colored";
type SandboxEvent = "deal" | "select" | "reset" | "reveal-colors" | "hide-colors";
type ViewMode = "normal" | "spymaster";

interface SandboxCardState {
  word: string;
  teamName: string;
  selected: boolean;
  displayState: SandboxDisplayState;
  isTransitioning: boolean;
}

interface SandboxTransition {
  entityId: string;
  event: SandboxEvent;
  fromState: SandboxDisplayState;
  toState: SandboxDisplayState;
}

interface PendingBatch {
  transitions: Map<string, SandboxTransition>;
  stagger?: number;
}

interface SandboxStore {
  cards: Map<string, SandboxCardState>;
  viewMode: ViewMode;
  cardOrder: string[];
  pendingBatch: PendingBatch | null;

  initialiseCard: (word: string, teamName: string) => void;
  initialiseCards: (cards: Array<{ word: string; teamName: string }>) => void;
  initialiseFromGameCards: (gameCards: Array<{ word: string; teamName: string }>) => void;
  dealCard: (word: string) => void;
  dealCards: (words: string[], stagger?: number) => void;
  selectCard: (word: string) => void;
  resetCard: (word: string) => void;
  resetAll: () => void;
  toggleViewMode: (stagger?: number) => void;

  commitTransitions: (entityIds: string[]) => void;
}

// ============= STATE MACHINE =============

function determineNextSandboxState(
  current: SandboxDisplayState,
  event: SandboxEvent,
  viewMode: ViewMode,
): SandboxDisplayState | null {
  const transitions: Record<
    SandboxDisplayState,
    Partial<Record<SandboxEvent, SandboxDisplayState>>
  > = {
    hidden: {
      deal: "visible",
    },
    visible: {
      select: "covered",
      "reveal-colors": "visible-colored",
      reset: "hidden",
    },
    "visible-colored": {
      select: "covered",
      "hide-colors": "visible",
      reset: "hidden",
    },
    covered: {
      reset: "hidden",
    },
  };

  return transitions[current]?.[event] ?? null;
}

// ============= STORE =============

export const useSandboxStore = create<SandboxStore>((set, get) => ({
  cards: new Map(),
  viewMode: "normal",
  cardOrder: [],
  pendingBatch: null,

  initialiseCard: (word: string, teamName: string) => {
    set((state) => {
      const newCards = new Map(state.cards);
      const newCardOrder = [...state.cardOrder];

      if (!newCards.has(word)) {
        newCards.set(word, {
          word,
          teamName,
          selected: false,
          displayState: "hidden",
          isTransitioning: false,
        });
        newCardOrder.push(word);
      }

      return { cards: newCards, cardOrder: newCardOrder };
    });
  },

  initialiseCards: (cardsData) => {
    set(() => {
      const newCards = new Map<string, SandboxCardState>();
      const newCardOrder: string[] = [];

      cardsData.forEach((card) => {
        newCards.set(card.word, {
          word: card.word,
          teamName: card.teamName,
          selected: false,
          displayState: "hidden",
          isTransitioning: false,
        });
        newCardOrder.push(card.word);
      });

      return { cards: newCards, cardOrder: newCardOrder };
    });
  },

  initialiseFromGameCards: (gameCards) => {
    set(() => {
      const newCards = new Map<string, SandboxCardState>();
      const newCardOrder: string[] = [];

      gameCards.forEach((card) => {
        newCards.set(card.word, {
          word: card.word,
          teamName: card.teamName,
          selected: false,
          displayState: "hidden",
          isTransitioning: false,
        });
        newCardOrder.push(card.word);
      });

      return { cards: newCards, cardOrder: newCardOrder };
    });
  },

  dealCard: (word: string) => {
    const { cards, viewMode } = get();
    const card = cards.get(word);
    if (!card || card.isTransitioning) return;

    const nextState = determineNextSandboxState(card.displayState, "deal", viewMode);
    if (!nextState) return;

    set((state) => {
      const newCards = new Map(state.cards);
      const currentCard = newCards.get(word)!;
      newCards.set(word, { ...currentCard, isTransitioning: true });

      const transitions = new Map<string, SandboxTransition>();
      transitions.set(word, {
        entityId: word,
        event: "deal",
        fromState: card.displayState,
        toState: nextState,
      });

      return {
        cards: newCards,
        pendingBatch: { transitions },
      };
    });
  },

  dealCards: (words: string[], stagger?: number) => {
    const { cards, viewMode } = get();

    const transitions = new Map<string, SandboxTransition>();
    const newCards = new Map(cards);

    words.forEach((word) => {
      const card = cards.get(word);
      if (!card || card.isTransitioning) return;

      const nextState = determineNextSandboxState(card.displayState, "deal", viewMode);
      if (!nextState) return;

      newCards.set(word, { ...card, isTransitioning: true });
      transitions.set(word, {
        entityId: word,
        event: "deal",
        fromState: card.displayState,
        toState: nextState,
      });
    });

    if (transitions.size === 0) return;

    set({
      cards: newCards,
      pendingBatch: { transitions, stagger },
    });
  },

  selectCard: (word: string) => {
    const { cards, viewMode } = get();
    const card = cards.get(word);
    if (!card || card.isTransitioning) return;

    const nextState = determineNextSandboxState(card.displayState, "select", viewMode);
    if (!nextState) return;

    set((state) => {
      const newCards = new Map(state.cards);
      const currentCard = newCards.get(word)!;
      newCards.set(word, { ...currentCard, isTransitioning: true });

      const transitions = new Map<string, SandboxTransition>();
      transitions.set(word, {
        entityId: word,
        event: "select",
        fromState: card.displayState,
        toState: nextState,
      });

      return {
        cards: newCards,
        pendingBatch: { transitions },
      };
    });
  },

  resetCard: (word: string) => {
    const { cards, viewMode } = get();
    const card = cards.get(word);
    if (!card || card.isTransitioning) return;

    const nextState = determineNextSandboxState(card.displayState, "reset", viewMode);
    if (!nextState) return;

    set((state) => {
      const newCards = new Map(state.cards);
      const currentCard = newCards.get(word)!;
      newCards.set(word, { ...currentCard, isTransitioning: true });

      const transitions = new Map<string, SandboxTransition>();
      transitions.set(word, {
        entityId: word,
        event: "reset",
        fromState: card.displayState,
        toState: nextState,
      });

      return {
        cards: newCards,
        pendingBatch: { transitions },
      };
    });
  },

  resetAll: () => {
    set({
      cards: new Map(),
      cardOrder: [],
      viewMode: "normal",
      pendingBatch: null,
    });
  },

  toggleViewMode: (stagger?: number) => {
    const { cards, viewMode } = get();
    const newMode: ViewMode = viewMode === "normal" ? "spymaster" : "normal";
    const event: SandboxEvent = newMode === "spymaster" ? "reveal-colors" : "hide-colors";

    const transitions = new Map<string, SandboxTransition>();
    const newCards = new Map(cards);

    cards.forEach((card, word) => {
      if (card.displayState === "hidden" || card.displayState === "covered") {
        return;
      }

      const nextState = determineNextSandboxState(card.displayState, event, newMode);
      if (!nextState) return;

      newCards.set(word, { ...card, isTransitioning: true });
      transitions.set(word, {
        entityId: word,
        event,
        fromState: card.displayState,
        toState: nextState,
      });
    });

    if (transitions.size === 0) {
      set({ viewMode: newMode });
      return;
    }

    set({
      cards: newCards,
      viewMode: newMode,
      pendingBatch: { transitions, stagger },
    });
  },

  commitTransitions: (entityIds: string[]) => {
    set((state) => {
      if (!state.pendingBatch) return state;

      const newCards = new Map(state.cards);

      entityIds.forEach((entityId) => {
        const transition = state.pendingBatch!.transitions.get(entityId);
        const card = newCards.get(entityId);

        if (transition && card) {
          newCards.set(entityId, {
            ...card,
            displayState: transition.toState,
            isTransitioning: false,
            selected: transition.toState === "covered" ? true : card.selected,
          });
        }
      });

      return {
        cards: newCards,
        pendingBatch: null,
      };
    });
  },
}));

// ============= COORDINATOR =============

export function useSandboxCoordinator() {
  const pendingBatch = useSandboxStore((state) => state.pendingBatch);
  const commitTransitions = useSandboxStore((state) => state.commitTransitions);

  usePendingAnimations(pendingBatch, commitTransitions);
}

// ============= CARD HOOK =============

export function useSandboxCardVisibility(word: string, index: number) {
  const card = useSandboxStore((state) => state.cards.get(word));
  const viewMode = useSandboxStore((state) => state.viewMode);

  const entityContext = useMemo(
    () => ({
      ...card,
      viewMode,
      index,
    }),
    [card, viewMode, index],
  );

  const { createAnimationRef } = useAnimationRegistration(word, entityContext);

  return {
    card,
    displayState: card?.displayState || "hidden",
    isTransitioning: card?.isTransitioning || false,
    createAnimationRef,
  };
}
