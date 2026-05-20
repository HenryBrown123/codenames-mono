import { createContext, useContext, useCallback, useRef, useState, type ReactNode } from "react";

/**
 * Shape provided by the tracked-animation context — a flag and the
 * two enter/exit callbacks each motion element calls into.
 */
interface TrackedAnimationContextValue {
  /** True while at least one tracked animation is in progress */
  isAnimating: boolean;
  onTrackedAnimationStart: () => void;
  onTrackedAnimationEnd: () => void;
}

const TrackedAnimationContext = createContext<TrackedAnimationContextValue | null>(null);

/**
 * Tracks the count of in-flight animations.
 *
 * Children call `onTrackedAnimationStart` / `onTrackedAnimationEnd`
 * from their motion handlers; `isAnimating` stays true while at least
 * one is outstanding so callers can gate transitions on a quiescent
 * board.
 */
export const TrackedAnimationProvider = ({ children }: { children: ReactNode }) => {
  const pending = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onTrackedAnimationStart = useCallback(() => {
    pending.current++;
    setIsAnimating(true);
  }, []);

  const onTrackedAnimationEnd = useCallback(() => {
    pending.current = Math.max(0, pending.current - 1);
    if (pending.current === 0) setIsAnimating(false);
  }, []);

  return (
    <TrackedAnimationContext.Provider value={{ isAnimating, onTrackedAnimationStart, onTrackedAnimationEnd }}>
      {children}
    </TrackedAnimationContext.Provider>
  );
};

/** Subscribes to the tracked-animation context. Throws if no provider is mounted. */
export const useTrackedAnimation = (): TrackedAnimationContextValue => {
  const ctx = useContext(TrackedAnimationContext);
  if (!ctx) throw new Error("useTrackedAnimation must be used within TrackedAnimationProvider");
  return ctx;
};
