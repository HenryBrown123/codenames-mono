import { createContext, useContext, useCallback, useRef, useState, type ReactNode } from "react";

/**
 * Tracks in-flight animations so other parts of the UI can wait for them to settle.
 *
 * Usage:
 *   onTrackedAnimationStart / onTrackedAnimationEnd on any motion.div
 *   useTrackedAnimation().isAnimating to gate transitions
 */

interface TrackedAnimationContextValue {
  /** True while at least one tracked animation is in progress */
  isAnimating: boolean;
  onTrackedAnimationStart: () => void;
  onTrackedAnimationEnd: () => void;
}

const TrackedAnimationContext = createContext<TrackedAnimationContextValue | null>(null);

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

export const useTrackedAnimation = (): TrackedAnimationContextValue => {
  const ctx = useContext(TrackedAnimationContext);
  if (!ctx) throw new Error("useTrackedAnimation must be used within TrackedAnimationProvider");
  return ctx;
};
