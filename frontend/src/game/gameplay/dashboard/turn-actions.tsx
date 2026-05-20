import { createContext, useState, useCallback, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGiveClueMutation, useEndTurnMutation } from "../api/mutations";
import { useMakeGuessMutation } from "../board/use-make-guess";
import { useGameDataRequired } from "../providers";
import { useTurn } from "../providers";

/** Names of every turn-level dashboard action. */
export type TurnActionName = "giveClue" | "makeGuess" | "endTurn";

/** Lifecycle state of the most recent turn action. */
export interface TurnActionState {
  name: TurnActionName | null;
  status: "idle" | "loading" | "success" | "error";
  error?: Error | null;
}

/** Read-side state exposed by the turn-actions context. */
export interface TurnActionsData {
  actionState: TurnActionState;
  isPending: boolean;
}

/** Write-side handlers exposed by the turn-actions context. */
export interface TurnActionsHandlers {
  giveClue: (word: string, count: number) => void;
  makeGuess: (word: string) => void;
  endTurn: () => void;
  resetActionState: () => void;
}

/** Shape provided by {@link TurnActionsContext}. */
export type TurnActionsContextValue = TurnActionsData & TurnActionsHandlers;

/** Context for turn-level dashboard actions. Use {@link useTurnActions}. */
export const TurnActionsContext = createContext<TurnActionsContextValue | undefined>(undefined);

const initialState: TurnActionState = {
  name: null,
  status: "idle",
  error: null,
};

interface TurnActionsProviderProps {
  children: ReactNode;
}

/**
 * Provides turn-level mutation handlers (`giveClue`, `makeGuess`,
 * `endTurn`) and their idle/loading/error state. Successful mutations
 * stamp the resulting turn id onto the turn provider so the dashboard
 * can detect "did my last action just complete?" and invalidate the
 * game-data / turn / AI-status queries.
 *
 * Does NOT automatically start the next turn after `endTurn` — that
 * transition is owned by the between-turns countdown so single-device
 * and multi-device games share the same UX.
 */
export const TurnActionsProvider = ({ children }: TurnActionsProviderProps) => {
  const [actionState, setActionState] = useState<TurnActionState>(initialState);

  const { gameData, gameId } = useGameDataRequired();
  const { setLastActionTurnId } = useTurn();
  const queryClient = useQueryClient();

  const giveClueMutation = useGiveClueMutation(gameId);
  const makeGuessMutation = useMakeGuessMutation(gameId);
  const endTurnMutation = useEndTurnMutation(gameId);

  const resetActionState = useCallback(() => {
    setActionState(initialState);
  }, []);

  const invalidateGameData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["gameData"] });
    queryClient.invalidateQueries({ queryKey: ["turn"] });
    queryClient.invalidateQueries({ queryKey: ["game", gameId, "ai", "status"] });
  }, [queryClient, gameId]);

  const makeGuess = useCallback(
    async (word: string) => {
      if (!gameData.currentRound) return;

      const roundNumber = gameData.currentRound.roundNumber;
      setActionState({ name: "makeGuess", status: "loading", error: null });

      makeGuessMutation.mutate(
        { cardWord: word, roundNumber },
        {
          onSuccess: (res) => {
            setLastActionTurnId(res.turn.id);
            setActionState({ name: "makeGuess", status: "success", error: null });
            invalidateGameData();
          },
          onError: (error) => {
            console.error("Failed to make guess:", error);
            setActionState({ name: "makeGuess", status: "error", error });
          },
        },
      );
    },
    [makeGuessMutation, gameData.currentRound, setLastActionTurnId, invalidateGameData],
  );

  const giveClue = useCallback(
    (word: string, count: number) => {
      if (!gameData.currentRound) return;

      const roundNumber = gameData.currentRound.roundNumber;
      setActionState({ name: "giveClue", status: "loading", error: null });

      giveClueMutation.mutate(
        { word, targetCardCount: count, roundNumber },
        {
          onSuccess: (res) => {
            setLastActionTurnId(res.turn.id);
            setActionState({ name: "giveClue", status: "success", error: null });
            invalidateGameData();
          },
          onError: (error) => {
            console.error("Failed to give clue:", error);
            setActionState({ name: "giveClue", status: "error", error });
          },
        },
      );
    },
    [giveClueMutation, gameData.currentRound, setLastActionTurnId, invalidateGameData],
  );

  const endTurn = useCallback(() => {
    if (!gameData.currentRound) return;

    const roundNumber = gameData.currentRound.roundNumber;
    setActionState({ name: "endTurn", status: "loading", error: null });

    endTurnMutation.mutate(
      { roundNumber },
      {
        onSuccess: () => {
          setActionState({ name: "endTurn", status: "success", error: null });
          invalidateGameData();
          /**
           * Do NOT start the next turn here. The between-turns window
           * (TurnOutcomePanel + DotCountdown + NextTurnTrigger) owns that
           * transition for BOTH single- and multi-device games. See
           * shared/post-turn.rules.ts.
           */
        },
        onError: (error) => {
          console.error("Failed to end turn:", error);
          setActionState({ name: "endTurn", status: "error", error });
        },
      },
    );
  }, [endTurnMutation, gameData.currentRound, invalidateGameData]);

  const value: TurnActionsContextValue = {
    actionState,
    isPending: actionState.status === "loading",
    giveClue,
    makeGuess,
    endTurn,
    resetActionState,
  };

  return <TurnActionsContext.Provider value={value}>{children}</TurnActionsContext.Provider>;
};

/** Subscribes to {@link TurnActionsContext}. Throws if no provider is mounted. */
export const useTurnActions = (): TurnActionsContextValue => {
  const context = useContext(TurnActionsContext);
  if (context === undefined) {
    throw new Error("useTurnActions must be used within TurnActionsProvider");
  }
  return context;
};
