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
  fromState: SandboxDisplayState;
  toState: SandboxDisplayState;
  animationType: string;
}

interface SandboxStore {
  cards: Map<string, SandboxCardState>;
  viewMode: ViewMode;
  cardOrder: string[];
  pendingTransitions: Map<string, SandboxTransition>;

  initializeCard: (word: string, teamName: string) => void;
  initializeCards: (cards: Array<{ word: string; teamName: string }>) => void;
  dealCard: (word: string) => void;
  dealCards: (words: string[]) => void;
  selectCard: (word: string) => void;
  resetCard: (word: string) => void;
  resetAll: () => void;
  toggleViewMode: () => void;

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
  pendingTransitions: new Map(),

  initializeCard: (word: string, teamName: string) => {
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

  initializeCards: (cardsData) => {
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

      const newTransitions = new Map(state.pendingTransitions);
      newTransitions.set(word, {
        entityId: word,
        fromState: card.displayState,
        toState: nextState,
        animationType: "deal",
      });

      return {
        cards: newCards,
        pendingTransitions: newTransitions,
      };
    });
  },

  dealCards: (words: string[]) => {
    const { cards, viewMode } = get();

    const newTransitions = new Map<string, SandboxTransition>();
    const newCards = new Map(cards);

    words.forEach((word) => {
      const card = cards.get(word);
      if (!card || card.isTransitioning) return;

      const nextState = determineNextSandboxState(card.displayState, "deal", viewMode);
      if (!nextState) return;

      newCards.set(word, { ...card, isTransitioning: true });
      newTransitions.set(word, {
        entityId: word,
        fromState: card.displayState,
        toState: nextState,
        animationType: "deal",
      });
    });

    if (newTransitions.size === 0) return;

    set({
      cards: newCards,
      pendingTransitions: newTransitions,
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

      const newTransitions = new Map(state.pendingTransitions);
      newTransitions.set(word, {
        entityId: word,
        fromState: card.displayState,
        toState: nextState,
        animationType: "select",
      });

      return {
        cards: newCards,
        pendingTransitions: newTransitions,
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

      const newTransitions = new Map(state.pendingTransitions);
      newTransitions.set(word, {
        entityId: word,
        fromState: card.displayState,
        toState: nextState,
        animationType: "reset",
      });

      return {
        cards: newCards,
        pendingTransitions: newTransitions,
      };
    });
  },

  resetAll: () => {
    set({
      cards: new Map(),
      cardOrder: [],
      viewMode: "normal",
      pendingTransitions: new Map(),
    });
  },

  toggleViewMode: () => {
    const { cards, viewMode } = get();
    const newMode: ViewMode = viewMode === "normal" ? "spymaster" : "normal";
    const event: SandboxEvent = newMode === "spymaster" ? "reveal-colors" : "hide-colors";

    const newTransitions = new Map<string, SandboxTransition>();
    const newCards = new Map(cards);

    cards.forEach((card, word) => {
      if (card.displayState === "hidden" || card.displayState === "covered") {
        return;
      }

      const nextState = determineNextSandboxState(card.displayState, event, newMode);
      if (!nextState) return;

      newCards.set(word, { ...card, isTransitioning: true });
      newTransitions.set(word, {
        entityId: word,
        fromState: card.displayState,
        toState: nextState,
        animationType: event,
      });
    });

    set({
      cards: newCards,
      viewMode: newMode,
      pendingTransitions: newTransitions,
    });
  },

  commitTransitions: (entityIds: string[]) => {
    set((state) => {
      const newCards = new Map(state.cards);

      entityIds.forEach((entityId) => {
        const transition = state.pendingTransitions.get(entityId);
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
        pendingTransitions: new Map(),
      };
    });
  },
}));

// ============= COORDINATOR =============

export function useSandboxCoordinator() {
  const pendingTransitions = useSandboxStore((state) => state.pendingTransitions);
  const commitTransitions = useSandboxStore((state) => state.commitTransitions);

  usePendingAnimations(pendingTransitions, commitTransitions);
}

// ============= CARD HOOK =============

export function useSandboxCardVisibility(word: string, index: number) {
  const card = useSandboxStore((state) => state.cards.get(word));
  const viewMode = useSandboxStore((state) => state.viewMode);

  const entityContext = useMemo(
    () => ({
      word: card?.word || word,
      teamName: card?.teamName || "",
      selected: card?.selected || false,
      displayState: card?.displayState || "hidden",
      isTransitioning: card?.isTransitioning || false,
      viewMode,
      index,
    }),
    [
      word,
      card?.word,
      card?.teamName,
      card?.selected,
      card?.displayState,
      card?.isTransitioning,
      viewMode,
      index,
    ],
  );

  const { createAnimationRef } = useAnimationRegistration(word, entityContext);

  return {
    card,
    displayState: card?.displayState || "hidden",
    isTransitioning: card?.isTransitioning || false,
    createAnimationRef,
  };
}
