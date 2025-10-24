import { create } from 'zustand';

export { useSandboxCardVisibility } from './use-sandbox-card-visibility-stub';

type SandboxDisplayState = 'hidden' | 'visible' | 'covered' | 'visible-colored';

interface SandboxCardState {
  word: string;
  teamName: string;
  selected: boolean;
  displayState: SandboxDisplayState;
}

interface SandboxStore {
  cards: Map<string, SandboxCardState>;

  initialiseCards: (cards: Array<{ word: string; teamName: string }>) => void;
  initialiseFromGameCards: (cards: Array<{ word: string; teamName: string }>) => void;
  selectCard: (word: string) => void;
  resetAll: () => void;
  // Deprecated methods for backward compatibility
  dealCards: (words: string[], stagger?: number) => void;
}

export const useSandboxStore = create<SandboxStore>((set) => ({
  cards: new Map(),

  initialiseCards: (cardsData) => {
    set(() => {
      const newCards = new Map<string, SandboxCardState>();

      cardsData.forEach((card) => {
        newCards.set(card.word, {
          word: card.word,
          teamName: card.teamName,
          selected: false,
          displayState: 'hidden', // Cards start hidden, will auto-deal via entry transition
        });
      });

      return { cards: newCards };
    });
  },

  // Alias for compatibility with game components
  initialiseFromGameCards: (cardsData) => {
    set(() => {
      const newCards = new Map<string, SandboxCardState>();

      cardsData.forEach((card) => {
        newCards.set(card.word, {
          word: card.word,
          teamName: card.teamName,
          selected: false,
          displayState: 'hidden',
        });
      });

      return { cards: newCards };
    });
  },

  selectCard: (word: string) => {
    set((state) => {
      const card = state.cards.get(word);
      if (!card) return state;

      const newCards = new Map(state.cards);
      newCards.set(word, { ...card, selected: true });

      return { cards: newCards };
    });
  },

  resetAll: () => {
    set({ cards: new Map() });
  },

  // Deprecated - does nothing in new architecture (cards auto-deal via entry transition)
  dealCards: () => {
    // No-op for backward compatibility
  },
}));
