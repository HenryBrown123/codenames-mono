import { createContext, useContext, useState, ReactNode } from "react";
import { useTurnDataQuery } from "../api/queries/use-turn-query";
import { TurnData } from "@frontend/shared-types";
import { useGameDataRequired as useGameData } from "../game-data/game-data.provider";

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
interface TurnProviderProps {
  children: ReactNode;
}

/**
 * Turn provider component
 * Automatically populates with current active turn from game data
 */
export const TurnProvider = ({ children }: TurnProviderProps) => {
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

  console.log("Turn provider debug:", {
    lastActionTurnId,
    activeTurnId,
    queryData: turnQuery.data,
  });

  return <TurnContext.Provider value={contextValue}>{children}</TurnContext.Provider>;
};

/**
 * Hook to access turn context
 * Must be used within a TurnProvider
 */
export const useTurn = (): TurnContextType => {
  const context = useContext(TurnContext);

  if (context === undefined) {
    throw new Error("useTurn must be used within a TurnProvider");
  }

  return context;
};
