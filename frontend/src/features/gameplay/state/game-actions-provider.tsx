import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import {
  useGiveClueMutation,
  useMakeGuessMutation,
  useCreateRoundMutation,
  useStartRoundMutation,
  useDealCardsMutation,
  useEndTurnMutation,
} from "@frontend/game/api/mutations";
import { useGameData } from "./game-data-provider";
import { useUIScene } from "./ui-scene-provider";
import { useTurn } from "./active-turn-provider";

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
  dealCards: () => void;
  endTurn: () => void;
}

const GameActionsContext = createContext<GameActionsContextValue | undefined>(
  undefined,
);

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

  const { gameData, gameId } = useGameData();
  const { handleSceneTransition } = useUIScene();
  const { setLastActionTurnId } = useTurn();

  const giveClueMutation = useGiveClueMutation(gameId);
  const makeGuessMutation = useMakeGuessMutation(gameId);
  const createRoundMutation = useCreateRoundMutation(gameId);
  const startRoundMutation = useStartRoundMutation(gameId);
  const dealCardsMutation = useDealCardsMutation(gameId);
  const endTurnMutation = useEndTurnMutation(gameId);

  const resetActionState = useCallback(() => {
    setActionState(initialState);
  }, []);

  const makeGuess = useCallback(
    (word: string) => {
      if (!gameData.currentRound) {
        console.error("Cannot make guess - no active round");
        return;
      }

      const roundNumber = gameData.currentRound.roundNumber;

      setActionState({ name: "makeGuess", status: "loading", error: null });

      makeGuessMutation.mutate(
        { roundNumber, cardWord: word },
        {
          onSuccess: (res) => {
            // Check if backend returned turn data
            if (res.success) {
              setLastActionTurnId(res.data.turn.id);
            }

            setActionState({
              name: "makeGuess",
              status: "success",
              error: null,
            });
            console.log("About to transition schene - GUESS_MADE");

            handleSceneTransition("GUESS_MADE");
          },
          onError: (error) => {
            setActionState({ name: "makeGuess", status: "error", error });
          },
        },
      );
    },
    [
      makeGuessMutation,
      gameData.currentRound,
      handleSceneTransition,
      setLastActionTurnId,
    ],
  );

  const giveClue = useCallback(
    (word: string, count: number) => {
      if (!gameData.currentRound) {
        console.error("Cannot give clue - no active round");
        return;
      }

      const roundNumber = gameData.currentRound.roundNumber;

      setActionState({ name: "giveClue", status: "loading", error: null });

      giveClueMutation.mutate(
        { roundNumber, word, targetCardCount: count },
        {
          onSuccess: (res) => {
            if (!res.success)
              throw new Error("Unhandled give clue mutation failure ");

            // ensure the turn Id of the submitted clue is being tracked by the UI
            setLastActionTurnId(res.data.turn.id);
            setActionState({
              name: "giveClue",
              status: "success",
              error: null,
            });
            handleSceneTransition("CLUE_SUBMITTED");
          },
          onError: (error) => {
            setActionState({ name: "giveClue", status: "error", error });
          },
        },
      );
    },
    [
      giveClueMutation,
      gameData.currentRound,
      handleSceneTransition,
      setLastActionTurnId,
    ],
  );

  const createRound = useCallback(() => {
    setActionState({ name: "createRound", status: "loading", error: null });

    createRoundMutation.mutate(undefined, {
      onSuccess: () => {
        setActionState({
          name: "createRound",
          status: "success",
          error: null,
        });
        handleSceneTransition("ROUND_CREATED");
      },
      onError: (error) => {
        setActionState({ name: "createRound", status: "error", error });
      },
    });
  }, [createRoundMutation, handleSceneTransition]);

  const startRound = useCallback(() => {
    if (!gameData.currentRound) {
      console.error("Cannot start round - no current round");
      return;
    }

    const roundNumber = gameData.currentRound.roundNumber;

    setActionState({ name: "startRound", status: "loading", error: null });

    startRoundMutation.mutate(
      { roundNumber },
      {
        onSuccess: () => {
          setActionState({
            name: "startRound",
            status: "success",
            error: null,
          });
          handleSceneTransition("ROUND_STARTED");
        },
        onError: (error) => {
          setActionState({ name: "startRound", status: "error", error });
        },
      },
    );
  }, [startRoundMutation, gameData.currentRound, handleSceneTransition]);

  const dealCards = useCallback(() => {
    if (!gameData.currentRound) {
      console.error("Cannot deal cards - no current round");
      return;
    }

    const roundNumber = gameData.currentRound.roundNumber;

    setActionState({ name: "dealCards", status: "loading", error: null });

    dealCardsMutation.mutate(
      { roundNumber },
      {
        onSuccess: () => {
          setActionState({
            name: "dealCards",
            status: "success",
            error: null,
          });
          handleSceneTransition("CARDS_DEALT");
        },
        onError: (error) => {
          setActionState({ name: "dealCards", status: "error", error });
        },
      },
    );
  }, [dealCardsMutation, gameData.currentRound, handleSceneTransition]);

  const endTurn = useCallback(() => {
    if (!gameData.currentRound) {
      console.error("Cannot end turn - no active round");
      return;
    }

    const roundNumber = gameData.currentRound.roundNumber;

    setActionState({ name: "endTurn", status: "loading", error: null });

    endTurnMutation.mutate(
      { roundNumber },
      {
        onSuccess: () => {
          setActionState({ name: "endTurn", status: "success", error: null });
          handleSceneTransition("TURN_ENDED");
        },
        onError: (error) => {
          setActionState({ name: "endTurn", status: "error", error });
        },
      },
    );
  }, [endTurnMutation, gameData.currentRound, handleSceneTransition]);

  const value: GameActionsContextValue = {
    actionState,
    resetActionState,
    makeGuess,
    giveClue,
    createRound,
    startRound,
    dealCards,
    endTurn,
  };

  return (
    <GameActionsContext.Provider value={value}>
      {children}
    </GameActionsContext.Provider>
  );
};

/**
 * Hook to access game actions and action state
 */
export const useGameActions = () => {
  const context = useContext(GameActionsContext);
  if (context === undefined) {
    throw new Error("useGameActions must be used within GameActionsProvider");
  }
  return context;
};
