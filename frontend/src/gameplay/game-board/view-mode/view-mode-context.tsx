import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ViewMode = "normal" | "spymaster";

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleSpymasterViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

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

export const useViewMode = (viewMode: ViewMode = "normal") => {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode must be used within ViewModeProvider");
  }
  return ctx;
};
