import { createContext, useContext, useState, ReactNode } from "react";
import { useTurnDataQuery, TurnData } from "../api/use-turn-query";
import { useGameDataRequired as useGameData } from "./game-data-provider";

/**
 * Turn context type definition
 */
interface TurnContextType {
  activeTurn: TurnData | null;
  isLoading: boolean;
  error: Error | null;
  setLastActionTurnId: (publicId: string) => void;
  clearActiveTurn: () => void;
}

/**
 * Turn context - shared state for all gameplay components
 */
const TurnContext = createContext<TurnContextType | undefined>(undefined);

/**
 * Turn provider props
 */
interface TurnDataProviderProps {
  children: ReactNode;
}

/**
 * Turn provider component
 * Automatically populates with current active turn from game data
 */
export const TurnDataProvider = ({ children }: TurnDataProviderProps) => {
  const { gameData } = useGameData();

  // Track the turn ID of recently executed actions to allow outcomes to be presented even
  // after the active turn has changed.
  const [lastActionTurnId, setLastActionTurnId] = useState<string | null>(null);


  // Auto-populate with current active turn ID if none is being tracked by last action
  const activeTurnId =
    lastActionTurnId ||
    gameData.currentRound?.turns?.find((t) => t.status === "ACTIVE")?.id ||
    null;

  // Use the query hook to fetch turn data
  const turnQuery = useTurnDataQuery(activeTurnId);

  const contextValue: TurnContextType = {
    activeTurn: turnQuery.data || null,
    isLoading: turnQuery.isLoading,
    error: turnQuery.error,
    setLastActionTurnId: setLastActionTurnId,
    clearActiveTurn: () => setLastActionTurnId(null),
  };


  return <TurnContext.Provider value={contextValue}>{children}</TurnContext.Provider>;
};

/**
 * Hook to access turn context
 * Must be used within a TurnDataProvider
 */
export const useTurn = (): TurnContextType => {
  const context = useContext(TurnContext);

  if (context === undefined) {
    throw new Error("useTurn must be used within a TurnDataProvider");
  }

  return context;
};
