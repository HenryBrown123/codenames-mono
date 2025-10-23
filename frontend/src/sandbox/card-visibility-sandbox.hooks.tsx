import { useMemo } from "react";
import { create } from "zustand";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";

// ============= TYPES =============

type SandboxDisplayState = "hidden" | "visible" | "covered" | "visible-colored";
type SandboxEvent = "deal" | "select" | "reset" | "reveal-colors" | "hide-colors";
type ViewMode = "normal" | "spymaster";

interface SandboxCardState {
  word: string;
  teamName: string;
  selected: boolean;
  displayState: SandboxDisplayState;
  pendingTransition: {
    event: SandboxEvent;
    toState: SandboxDisplayState;
  } | null;
}

interface SandboxStore {
  cards: Map<string, SandboxCardState>;
  viewMode: ViewMode;
  cardOrder: string[];

  initialiseCard: (word: string, teamName: string) => void;
  initialiseCards: (cards: Array<{ word: string; teamName: string }>) => void;
  initialiseFromGameCards: (gameCards: Array<{ word: string; teamName: string }>) => void;
  dealCard: (word: string) => void;
  dealCards: (words: string[], stagger?: number) => void;
  selectCard: (word: string) => void;
  resetCard: (word: string) => void;
  resetAll: () => void;
  toggleViewMode: (stagger?: number) => void;

  commitTransition: (entityId: string) => void;
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
          pendingTransition: null,
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
          pendingTransition: null,
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
          pendingTransition: null,
        });
        newCardOrder.push(card.word);
      });

      return { cards: newCards, cardOrder: newCardOrder };
    });
  },

  dealCard: (word: string) => {
    const { cards, viewMode } = get();
    const card = cards.get(word);
    if (!card || card.pendingTransition) return;

    const nextState = determineNextSandboxState(card.displayState, "deal", viewMode);
    if (!nextState) return;

    set((state) => {
      const newCards = new Map(state.cards);
      const currentCard = newCards.get(word)!;
      newCards.set(word, {
        ...currentCard,
        pendingTransition: { event: "deal", toState: nextState },
      });

      return { cards: newCards };
    });
  },

  dealCards: (words: string[], stagger?: number) => {
    const { cards, viewMode } = get();
    const newCards = new Map(cards);

    words.forEach((word) => {
      const card = cards.get(word);
      if (!card || card.pendingTransition) return;

      const nextState = determineNextSandboxState(card.displayState, "deal", viewMode);
      if (!nextState) return;

      newCards.set(word, {
        ...card,
        pendingTransition: { event: "deal", toState: nextState },
      });
    });

    set({ cards: newCards });
  },

  selectCard: (word: string) => {
    const { cards, viewMode } = get();
    const card = cards.get(word);
    if (!card || card.pendingTransition) return;

    const nextState = determineNextSandboxState(card.displayState, "select", viewMode);
    if (!nextState) return;

    set((state) => {
      const newCards = new Map(state.cards);
      const currentCard = newCards.get(word)!;
      newCards.set(word, {
        ...currentCard,
        pendingTransition: { event: "select", toState: nextState },
      });

      return { cards: newCards };
    });
  },

  resetCard: (word: string) => {
    const { cards, viewMode } = get();
    const card = cards.get(word);
    if (!card || card.pendingTransition) return;

    const nextState = determineNextSandboxState(card.displayState, "reset", viewMode);
    if (!nextState) return;

    set((state) => {
      const newCards = new Map(state.cards);
      const currentCard = newCards.get(word)!;
      newCards.set(word, {
        ...currentCard,
        pendingTransition: { event: "reset", toState: nextState },
      });

      return { cards: newCards };
    });
  },

  resetAll: () => {
    set({
      cards: new Map(),
      cardOrder: [],
      viewMode: "normal",
    });
  },

  toggleViewMode: (stagger?: number) => {
    const { cards, viewMode } = get();
    const newMode: ViewMode = viewMode === "normal" ? "spymaster" : "normal";
    const event: SandboxEvent = newMode === "spymaster" ? "reveal-colors" : "hide-colors";

    const newCards = new Map(cards);

    cards.forEach((card, word) => {
      if (card.displayState === "hidden" || card.displayState === "covered") {
        return;
      }

      const nextState = determineNextSandboxState(card.displayState, event, newMode);
      if (!nextState) return;

      newCards.set(word, {
        ...card,
        pendingTransition: { event, toState: nextState },
      });
    });

    set({
      cards: newCards,
      viewMode: newMode,
    });
  },

  commitTransition: (entityId: string) => {
    set((state) => {
      const card = state.cards.get(entityId);
      if (!card?.pendingTransition) return state;

      const newCards = new Map(state.cards);
      newCards.set(entityId, {
        ...card,
        displayState: card.pendingTransition.toState,
        pendingTransition: null,
        selected: card.pendingTransition.toState === "covered" ? true : card.selected,
      });

      return { cards: newCards };
    });
  },
}));

// ============= CARD HOOK =============

export function useSandboxCardVisibility(word: string, index: number) {
  const card = useSandboxStore((state) => state.cards.get(word));
  const viewMode = useSandboxStore((state) => state.viewMode);
  const commitTransition = useSandboxStore((state) => state.commitTransition);

  const entityContext = useMemo(
    () => ({
      teamName: card?.teamName,
      displayState: card?.displayState,
      selected: card?.selected,
      viewMode,
      index,
    }),
    [card?.teamName, card?.displayState, card?.selected, viewMode, index],
  );

  const { createAnimationRef } = useAnimationRegistration(word, entityContext, {
    pendingTransition: card?.pendingTransition,
    onComplete: commitTransition,
  });

  return {
    card,
    displayState: card?.displayState || "hidden",
    createAnimationRef,
  };
}
