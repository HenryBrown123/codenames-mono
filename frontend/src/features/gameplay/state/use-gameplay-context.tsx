import React, { useContext, createContext, ReactNode } from "react";
import { PlayerRole } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { useGameData } from "@frontend/game/api";
import { UIStateProvider, useUIState } from "./use-ui-state";
import { GameActionsProvider, useGameActions } from "./use-game-actions";

/**
 * Combined gameplay context props - aggregates all sub-contexts
 */
interface GameplayContextProps {
  gameData: GameData;
  currentStage: PlayerRole;
  currentScene: string;
  handleSceneTransition: (event: string) => void;
  setUIStage: (stage: PlayerRole) => void;
  handleGiveClue: (
    roundNumber: number,
    word: string,
    targetCardCount: number,
    callbacks?: any,
  ) => void;
  handleMakeGuess: (cardWord: string, callbacks?: any) => void;
  handleCreateRound: (callbacks?: any) => void;
  handleStartRound: (roundNumber: number, callbacks?: any) => void;
  handleDealCards: (roundId: string, callbacks?: any) => void;
  isLoading: {
    giveClue: boolean;
    makeGuess: boolean;
    createRound: boolean;
    startRound: boolean;
    dealCards: boolean;
  };
  errors: {
    giveClue: Error | null;
    makeGuess: Error | null;
    createRound: Error | null;
    startRound: Error | null;
    dealCards: Error | null;
  };
}

interface GameplayProviderProps {
  children: ReactNode;
  gameId: string;
}

const GameplayContext = createContext<GameplayContextProps | null>(null);

/**
 * Internal provider that aggregates all contexts for the legacy interface
 */
const GameplayContextAggregator = ({
  children,
  gameData,
}: {
  children: ReactNode;
  gameData: GameData;
}): JSX.Element => {
  const uiState = useUIState();
  const gameActions = useGameActions();

  return (
    <GameplayContext.Provider
      value={{
        gameData,
        ...uiState,
        ...gameActions,
      }}
    >
      {children}
    </GameplayContext.Provider>
  );
};

/**
 * Main Gameplay Context Provider - composes all sub-providers
 */
export const GameplayContextProvider = ({
  children,
  gameId,
}: GameplayProviderProps): JSX.Element => {
  const { data: gameData } = useGameData(gameId);

  if (!gameData?.playerContext?.role) {
    return <div>Loading game data...</div>;
  }

  return (
    <UIStateProvider gameData={gameData}>
      <GameActionsProvider gameId={gameId} gameData={gameData}>
        <GameplayContextAggregator gameData={gameData}>
          {children}
        </GameplayContextAggregator>
      </GameActionsProvider>
    </UIStateProvider>
  );
};

/**
 * Hook to access the aggregated gameplay context (legacy interface)
 */
export const useGameplayContext = (): GameplayContextProps => {
  const context = useContext(GameplayContext);
  if (!context) {
    throw new Error(
      "useGameplayContext must be used within a GameplayContextProvider",
    );
  }
  return context;
};
