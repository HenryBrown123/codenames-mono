import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/**
 * Context for managing deal animation state across board and button components
 */

export type DealInitialState = "hidden" | "visible";

interface DealAnimationContextValue {
  initialState: DealInitialState;
  triggerDeal: () => void;
  resetDeal: () => void;
}

const DealAnimationContext = createContext<DealAnimationContextValue | null>(null);

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

export const useDealAnimation = (): DealAnimationContextValue => {
  const context = useContext(DealAnimationContext);
  if (!context) {
    throw new Error("useDealAnimation must be used within DealAnimationProvider");
  }
  return context;
};
