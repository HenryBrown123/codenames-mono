import { create } from "zustand";
import type { VisualState, AnimationType, CardVisibilityData } from "./card-visibility-provider";

interface CardVisibilityStore {
  // Just data - no business logic
  cardData: Map<string, CardVisibilityData>;
  viewMode: "player" | "spymaster";

  // Just setters - no transitions or state machine
  setCardData: (data: Map<string, CardVisibilityData>) => void;
  setViewMode: (mode: "player" | "spymaster") => void;
  toggleSpymasterView: () => void;
  resetStore: () => void;
}

/**
 * Simple Zustand store - just replaces useState
 * All business logic stays in components
 */
export const useCardVisibilityStore = create<CardVisibilityStore>((set) => ({
  cardData: new Map(),
  viewMode: "player",

  setCardData: (data) => set({ cardData: data }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSpymasterView: () =>
    set((state) => ({
      viewMode: state.viewMode === "player" ? "spymaster" : "player",
    })),
  resetStore: () => set({ cardData: new Map(), viewMode: "player" }),
}));