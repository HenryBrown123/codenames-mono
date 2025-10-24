import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ViewMode = 'normal' | 'spymaster';

interface ViewModeContextValue {
  viewMode: ViewMode;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('normal');

  const toggleViewMode = useCallback(() => {
    setViewMode(v => v === 'normal' ? 'spymaster' : 'normal');
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error('useViewMode must be used within ViewModeProvider');
  }
  return ctx;
};
