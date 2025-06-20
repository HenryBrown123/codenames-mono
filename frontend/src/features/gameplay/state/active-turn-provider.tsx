import { createContext, useContext, useState, ReactNode } from "react";
import { TurnData, useTurnDataQuery } from "../api/queries/use-turn-query";

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
 * Manages shared turn state across all gameplay components
 * Follows the "mutations belong to turns" philosophy from the architecture
 */
export const TurnProvider = ({ children }: TurnProviderProps) => {
  // Track the public ID of the last action turn for outcome feedback
  const [lastActionTurnId, setLastActionTurnId] = useState<string | null>(null);

  // Use the query hook to fetch turn data
  const turnQuery = useTurnDataQuery(lastActionTurnId);

  const contextValue: TurnContextType = {
    /**
     * Current active turn data (null if no turn tracked)
     */
    activeTurn: turnQuery.data || null,
    isLoading: turnQuery.isLoading,
    error: turnQuery.error,
    setLastActionTurnId: setLastActionTurnId,
    clearActiveTurn: () => setLastActionTurnId(null),
  };

  console.log("Turn query debug:", {
    lastActionTurnId,
    queryData: turnQuery.data,
    queryStatus: turnQuery.status,
    activeTurn: turnQuery.data || null,
  });

  return (
    <TurnContext.Provider value={contextValue}>{children}</TurnContext.Provider>
  );
};

/**
 * Hook to access turn context
 * Must be used within a TurnProvider
 * @returns Turn context value
 */
export const useTurn = (): TurnContextType => {
  const context = useContext(TurnContext);

  if (context === undefined) {
    throw new Error("useTurn must be used within a TurnProvider");
  }

  return context;
};
