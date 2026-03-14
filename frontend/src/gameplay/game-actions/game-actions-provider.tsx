import { createContext, useState, useCallback, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGiveClueMutation, useMakeGuessMutation, useEndTurnMutation } from "./api";
import styles from "./game-actions-provider.module.css";
import {
  useCreateRoundMutation,
  useStartRoundMutation,
  useDealCardsMutation,
} from "../round-management";
import { useGameDataRequired, usePlayerContext } from "../game-data/providers";
import { useTurn } from "../game-data/providers";

export type ActionName =
  | "giveClue"
  | "makeGuess"
  | "createRound"
  | "startRound"
  | "dealCards"
  | "endTurn";

export interface ActionState {
  name: ActionName | null;
  status: "idle" | "loading" | "success" | "error";
  error?: Error | null;
}

export interface GameActionsContextValue {
  actionState: ActionState;
  resetActionState: () => void;
  giveClue: (word: string, count: number) => void;
  makeGuess: (word: string) => void;
  createRound: () => void;
  startRound: () => void;
  dealCards: (redeal?: boolean) => Promise<void>;
  endTurn: () => void;
}

export const GameActionsContext = createContext<GameActionsContextValue | undefined>(undefined);

const initialState: ActionState = {
  name: null,
  status: "idle",
  error: null,
};

interface GameActionsProviderProps {
  children: ReactNode;
}

export const GameActionsProvider = ({ children }: GameActionsProviderProps) => {
  const [actionState, setActionState] = useState<ActionState>(initialState);

  const { gameData, gameId } = useGameDataRequired();
  const { currentPlayerId } = usePlayerContext();
  const { setLastActionTurnId } = useTurn();
  const queryClient = useQueryClient();

  const giveClueMutation = useGiveClueMutation(gameId);
  const makeGuessMutation = useMakeGuessMutation(gameId);
  const createRoundMutation = useCreateRoundMutation(gameId);
  const startRoundMutation = useStartRoundMutation(gameId);
  const dealCardsMutation = useDealCardsMutation(gameId);
  const endTurnMutation = useEndTurnMutation(gameId);

  const resetActionState = useCallback(() => {
    setActionState(initialState);
  }, []);

  // Invalidate game data after local action for immediate UI update.
  // Remote players get updates via WebSocket → useWebSocketInvalidation.
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
        },
        onError: (error) => {
          console.error("Failed to end turn:", error);
          setActionState({ name: "endTurn", status: "error", error });
        },
      },
    );
  }, [endTurnMutation, gameData.currentRound, invalidateGameData]);

  const value: GameActionsContextValue = {
    actionState,
    resetActionState,
    giveClue,
    makeGuess,
    createRound,
    startRound,
    dealCards,
    endTurn,
  };

  if (actionState.status === "error") {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBackdrop} />
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Action Failed</h2>
          <p className={styles.errorMessage}>
            {actionState.error?.message || "Something went wrong. This might be a temporary issue."}
          </p>
          <button className={styles.reloadButton} onClick={() => window.location.reload()}>
            Reload Game
          </button>
        </div>
      </div>
    );
  }

  return <GameActionsContext.Provider value={value}>{children}</GameActionsContext.Provider>;
};

export const useGameActions = (): GameActionsContextValue => {
  const context = useContext(GameActionsContext);
  if (context === undefined) {
    throw new Error("useGameActions must be used within GameActionsProvider");
  }
  return context;
};
