import { ReactNode } from "react";
import styles from "./game-actions-provider.module.css";
import {
  TurnActionsProvider,
  useTurnActions,
  type TurnActionsContextValue,
  type TurnActionName,
  type TurnActionState,
} from "./turn-actions";
import {
  RoundActionsProvider,
  useRoundActions,
  type RoundActionsContextValue,
  type RoundActionName,
  type RoundActionState,
} from "./round-actions";

/** All action names (union of turn and round) */
export type ActionName = TurnActionName | RoundActionName;

/** Combined action state */
export interface ActionState {
  name: ActionName | null;
  status: "idle" | "loading" | "success" | "error";
  error?: Error | null;
}

/** Legacy combined context value for backwards compatibility */
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

interface GameActionsProviderProps {
  children: ReactNode;
}

/**
 * Composes TurnActionsProvider and RoundActionsProvider.
 * Also renders error UI when either provider has an error.
 */
export const GameActionsProvider = ({ children }: GameActionsProviderProps) => {
  return (
    <RoundActionsProvider>
      <TurnActionsProvider>
        <GameActionsErrorBoundary>{children}</GameActionsErrorBoundary>
      </TurnActionsProvider>
    </RoundActionsProvider>
  );
};

/** Inner component that can access both contexts for error handling */
const GameActionsErrorBoundary = ({ children }: { children: ReactNode }) => {
  const turnActions = useTurnActions();
  const roundActions = useRoundActions();

  const errorState =
    turnActions.actionState.status === "error"
      ? turnActions.actionState
      : roundActions.actionState.status === "error"
        ? roundActions.actionState
        : null;

  if (errorState) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBackdrop} />
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Action Failed</h2>
          <p className={styles.errorMessage}>
            {errorState.error?.message || "Something went wrong. This might be a temporary issue."}
          </p>
          <button className={styles.reloadButton} onClick={() => window.location.reload()}>
            Reload Game
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Facade hook that combines turn and round actions.
 * Use useTurnActions or useRoundActions for more specific access.
 */
export const useGameActions = (): GameActionsContextValue => {
  const turnActions = useTurnActions();
  const roundActions = useRoundActions();

  // Combine action states - prefer the one that's active
  const actionState: ActionState =
    turnActions.actionState.status !== "idle"
      ? turnActions.actionState
      : roundActions.actionState;

  const resetActionState = () => {
    turnActions.resetActionState();
    roundActions.resetActionState();
  };

  return {
    actionState,
    resetActionState,
    giveClue: turnActions.giveClue,
    makeGuess: turnActions.makeGuess,
    endTurn: turnActions.endTurn,
    createRound: roundActions.createRound,
    startRound: roundActions.startRound,
    dealCards: roundActions.dealCards,
  };
};

// Re-export split contexts and hooks
export { useTurnActions, useRoundActions };
export type {
  TurnActionsContextValue,
  TurnActionName,
  TurnActionState,
  RoundActionsContextValue,
  RoundActionName,
  RoundActionState,
};
