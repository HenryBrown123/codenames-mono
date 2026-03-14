import { createContext, useContext, useState, ReactNode } from "react";
import { useTurnDataQuery, TurnData } from "../queries/use-turn-query";
import { useGameDataRequired as useGameData } from "./game-data-provider";

/**
 * Turn context type definition
 */
export interface TurnContextType {
  activeTurn: TurnData | null;
  isLoading: boolean;
  error: Error | null;
  setLastActionTurnId: (publicId: string) => void;
  clearActiveTurn: () => void;
  /** All turns in the current round with full detail */
  historicTurns: TurnData[];
}

/**
 * Turn context - shared state for all gameplay components
 */
export const TurnContext = createContext<TurnContextType | undefined>(undefined);

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
  // Fall back to last turn in round (even if completed) to ensure historicTurns loads
  const turns = gameData.currentRound?.turns ?? [];

  // Auto-clear lastActionTurnId when that turn has completed
  // This allows activeTurnId to fall through to the natural game state
  if (lastActionTurnId) {
    const lastActionTurnStatus = turns.find((t) => t.id === lastActionTurnId)?.status;
    if (lastActionTurnStatus === "COMPLETED") {
      setLastActionTurnId(null);
    }
  }

  const activeTurnId =
    lastActionTurnId ||
    turns.find((t) => t.status === "ACTIVE")?.id ||
    turns[turns.length - 1]?.id ||
    null;

  // Use the query hook to fetch turn data (includes historicTurns)
  const turnQuery = useTurnDataQuery(activeTurnId);

  // Get historicTurns from query result (full TurnData[]), fall back to empty
  const historicTurns: TurnData[] = turnQuery.data?.historicTurns ?? [];

  const contextValue: TurnContextType = {
    activeTurn: turnQuery.data?.turn || null,
    isLoading: turnQuery.isLoading,
    error: turnQuery.error,
    setLastActionTurnId: setLastActionTurnId,
    clearActiveTurn: () => setLastActionTurnId(null),
    historicTurns,
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
