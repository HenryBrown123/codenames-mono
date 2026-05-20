import { createContext, useContext, useState, useCallback, ReactNode } from "react";

/** Board reveal mode — colours hidden ("normal") or revealed ("spymaster"). */
export type ViewMode = "normal" | "spymaster";

/** Shape provided by {@link ViewModeContext}. */
export interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleSpymasterViewMode: () => void;
}

/**
 * Context for the board's spymaster/normal toggle.
 *
 * `null` when no provider is mounted; consumers should use the
 * {@link useViewMode} hook rather than reading this directly.
 */
export const ViewModeContext = createContext<ViewModeContextValue | null>(null);

/** Provides view-mode state to the board subtree. Starts in "normal". */
export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("normal");

  const toggleSpymasterViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "spymaster" ? "normal" : "spymaster"));
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, toggleSpymasterViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

/**
 * Subscribes to {@link ViewModeContext}.
 *
 * Throws if used outside a `ViewModeProvider`. The optional argument
 * is a positional default for legacy callers and does not override
 * the live context value once mounted.
 */
export const useViewMode = (viewMode: ViewMode = "normal") => {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode must be used within ViewModeProvider");
  }
  return ctx;
};
