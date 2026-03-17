import { createContext, useState, useCallback, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateRoundMutation,
  useStartRoundMutation,
  useDealCardsMutation,
} from "../round-management";
import { useGameDataRequired } from "../game-data/providers";

/** Round action names */
export type RoundActionName = "createRound" | "startRound" | "dealCards";

/** State for a round action */
export interface RoundActionState {
  name: RoundActionName | null;
  status: "idle" | "loading" | "success" | "error";
  error?: Error | null;
}

/** Round actions context data */
export interface RoundActionsData {
  actionState: RoundActionState;
  isPending: boolean;
}

/** Round actions context handlers */
export interface RoundActionsHandlers {
  createRound: () => void;
  startRound: () => void;
  dealCards: (redeal?: boolean) => Promise<void>;
  resetActionState: () => void;
}

/** Combined round actions context value */
export type RoundActionsContextValue = RoundActionsData & RoundActionsHandlers;

export const RoundActionsContext = createContext<RoundActionsContextValue | undefined>(undefined);

const initialState: RoundActionState = {
  name: null,
  status: "idle",
  error: null,
};

interface RoundActionsProviderProps {
  children: ReactNode;
}

export const RoundActionsProvider = ({ children }: RoundActionsProviderProps) => {
  const [actionState, setActionState] = useState<RoundActionState>(initialState);

  const { gameData, gameId } = useGameDataRequired();
  const queryClient = useQueryClient();

  const createRoundMutation = useCreateRoundMutation(gameId);
  const startRoundMutation = useStartRoundMutation(gameId);
  const dealCardsMutation = useDealCardsMutation(gameId);

  const resetActionState = useCallback(() => {
    setActionState(initialState);
  }, []);

  const invalidateGameData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["gameData"] });
    queryClient.invalidateQueries({ queryKey: ["turn"] });
    queryClient.invalidateQueries({ queryKey: ["game", gameId, "ai", "status"] });
  }, [queryClient, gameId]);

  const createRound = useCallback(() => {
    setActionState({ name: "createRound", status: "loading", error: null });

    createRoundMutation.mutate(undefined, {
      onSuccess: () => {
        setActionState({ name: "createRound", status: "success", error: null });
        invalidateGameData();
      },
      onError: (error) => {
        console.error("Failed to create round:", error);
        setActionState({ name: "createRound", status: "error", error });
      },
    });
  }, [createRoundMutation, invalidateGameData]);

  const startRound = useCallback(() => {
    if (!gameData.currentRound) return;

    const roundNumber = gameData.currentRound.roundNumber;
    setActionState({ name: "startRound", status: "loading", error: null });

    startRoundMutation.mutate(
      { roundNumber },
      {
        onSuccess: () => {
          setActionState({ name: "startRound", status: "success", error: null });
          invalidateGameData();
        },
        onError: (error) => {
          console.error("Failed to start round:", error);
          setActionState({ name: "startRound", status: "error", error });
        },
      },
    );
  }, [startRoundMutation, gameData.currentRound, invalidateGameData]);

  const dealCards = useCallback(
    async (redeal: boolean = false): Promise<void> => {
      if (!gameData.currentRound) throw new Error("No active round");

      const roundNumber = gameData.currentRound.roundNumber;
      setActionState({ name: "dealCards", status: "loading", error: null });

      try {
        await dealCardsMutation.mutateAsync({ roundNumber, redeal });
        setActionState({ name: "dealCards", status: "success", error: null });
        invalidateGameData();
      } catch (error) {
        console.error("Failed to deal cards:", error);
        setActionState({ name: "dealCards", status: "error", error: error as Error });
        throw error;
      }
    },
    [dealCardsMutation, gameData.currentRound, invalidateGameData],
  );

  const value: RoundActionsContextValue = {
    actionState,
    isPending: actionState.status === "loading",
    createRound,
    startRound,
    dealCards,
    resetActionState,
  };

  return <RoundActionsContext.Provider value={value}>{children}</RoundActionsContext.Provider>;
};

export const useRoundActions = (): RoundActionsContextValue => {
  const context = useContext(RoundActionsContext);
  if (context === undefined) {
    throw new Error("useRoundActions must be used within RoundActionsProvider");
  }
  return context;
};
