import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import styled from "styled-components";
import {
  useGiveClueMutation,
  useMakeGuessMutation,
  useCreateRoundMutation,
  useStartRoundMutation,
  useDealCardsMutation,
  useEndTurnMutation,
} from "@frontend/gameplay/api/mutations";
import { useGameData } from "../game-data";
import { usePlayerRoleScene } from "../role-scenes";
import { useTurn } from "../turn-management";

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
  dealCards: (redeal?: boolean) => void;
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

// Error UI Components
const ErrorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
  z-index: 9999;
`;

const ErrorBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.5);
`;

const ErrorCard = styled.div`
  position: relative;
  background: rgba(31, 7, 7, 0.621);
  border: 2px solid rgba(239, 68, 68, 0.5);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const ErrorTitle = styled.h2`
  color: #ef4444;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ErrorDetails = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: left;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ReloadButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

interface GameActionsProviderProps {
  children: ReactNode;
}

export const GameActionsProvider = ({ children }: GameActionsProviderProps) => {
  const [actionState, setActionState] = useState<ActionState>(initialState);

  const { gameData, gameId } = useGameData();
  const { handleSceneTransition } = usePlayerRoleScene();
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
        return;
      }

      const roundNumber = gameData.currentRound.roundNumber;
      setActionState({ name: "makeGuess", status: "loading", error: null });

      makeGuessMutation.mutate(
        { cardWord: word, roundNumber },
        {
          onSuccess: (res) => {
            setLastActionTurnId(res.turn.id);

            setActionState({
              name: "makeGuess",
              status: "success",
              error: null,
            });

            handleSceneTransition("GUESS_MADE");
          },
          onError: (error) => {
            console.error("Failed to make guess:", error);
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
        return;
      }

      const roundNumber = gameData.currentRound.roundNumber;
      setActionState({ name: "giveClue", status: "loading", error: null });

      giveClueMutation.mutate(
        { word, targetCardCount: count, roundNumber },
        {
          onSuccess: (res) => {
            setLastActionTurnId(res.turn.id);
            setActionState({
              name: "giveClue",
              status: "success",
              error: null,
            });

            handleSceneTransition("CLUE_GIVEN");
          },
          onError: (error) => {
            console.error("Failed to give clue:", error);
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
        setActionState({ name: "createRound", status: "success", error: null });
        handleSceneTransition("GAME_STARTED");
      },
      onError: (error) => {
        console.error("Failed to create round:", error);
        setActionState({ name: "createRound", status: "error", error });
      },
    });
  }, [createRoundMutation, handleSceneTransition]);

  const startRound = useCallback(() => {
    if (!gameData.currentRound) {
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
          console.error("Failed to start round:", error);
          setActionState({ name: "startRound", status: "error", error });
        },
      },
    );
  }, [startRoundMutation, gameData.currentRound, handleSceneTransition]);

  const dealCards = useCallback((redeal: boolean = false) => {
    if (!gameData.currentRound) {
      return;
    }

    const roundNumber = gameData.currentRound.roundNumber;
    setActionState({ name: "dealCards", status: "loading", error: null });

    dealCardsMutation.mutate(
      { roundNumber, redeal },
      {
        onSuccess: () => {
          setActionState({ name: "dealCards", status: "success", error: null });
          if (!redeal) {
            handleSceneTransition("CARDS_DEALT");
          }
        },
        onError: (error) => {
          console.error("Failed to deal cards:", error);
          setActionState({ name: "dealCards", status: "error", error });
        },
      },
    );
  }, [dealCardsMutation, gameData.currentRound, handleSceneTransition]);

  const endTurn = useCallback(() => {
    if (!gameData.currentRound) {
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
          console.error("Failed to end turn:", error);
          setActionState({ name: "endTurn", status: "error", error });
        },
      },
    );
  }, [endTurnMutation, gameData.currentRound, handleSceneTransition]);

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

  // Show error UI when any action fails
  if (actionState.status === "error") {
    return (
      <ErrorContainer>
        <ErrorBackdrop />
        <ErrorCard>
          <ErrorTitle>Action Failed</ErrorTitle>
          <ErrorMessage>
            {actionState.error?.message || "Something went wrong. This might be a temporary issue."}
          </ErrorMessage>
          <ReloadButton onClick={() => window.location.reload()}>
            Reload Game
          </ReloadButton>
        </ErrorCard>
      </ErrorContainer>
    );
  }

  return (
    <GameActionsContext.Provider value={value}>
      {children}
    </GameActionsContext.Provider>
  );
};

export const useGameActions = (): GameActionsContextValue => {
  const context = useContext(GameActionsContext);
  if (context === undefined) {
    throw new Error("useGameActions must be used within GameActionsProvider");
  }
  return context;
};