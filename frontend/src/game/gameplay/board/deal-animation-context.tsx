import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/** Whether the cards should mount hidden (about to deal) or visible. */
export type DealInitialState = "hidden" | "visible";

interface DealAnimationContextValue {
  initialState: DealInitialState;
  triggerDeal: () => void;
  resetDeal: () => void;
}

const DealAnimationContext = createContext<DealAnimationContextValue | null>(null);

/**
 * Provides deal-animation state to the board subtree.
 *
 * `defaultState` controls whether the board mounts mid-deal (`hidden`)
 * or with cards already revealed (`visible`). Calling `triggerDeal()`
 * flips state to `hidden` so cards animate in; `resetDeal()` restores
 * the static state.
 */
export const DealAnimationProvider = ({ children, defaultState = "visible" as DealInitialState }: { children: ReactNode; defaultState?: DealInitialState }) => {
  const [initialState, setInitialState] = useState<DealInitialState>(defaultState);

  const triggerDeal = useCallback(() => {
    setInitialState("hidden");
  }, []);

  const resetDeal = useCallback(() => {
    setInitialState("visible");
  }, []);

  return (
    <DealAnimationContext.Provider value={{ initialState, triggerDeal, resetDeal }}>
      {children}
    </DealAnimationContext.Provider>
  );
};

/** Subscribes to the deal-animation context. Throws if no provider is mounted. */
export const useDealAnimation = (): DealAnimationContextValue => {
  const context = useContext(DealAnimationContext);
  if (!context) {
    throw new Error("useDealAnimation must be used within DealAnimationProvider");
  }
  return context;
};
