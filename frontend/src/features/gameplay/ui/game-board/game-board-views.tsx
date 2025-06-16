import React, { useCallback, useMemo, memo } from "react";
import { useGameplayContext } from "@frontend/game/state";
import { GameData, Card } from "@frontend/shared-types";
import { RenderCards } from "./game-board-utils";

const EMPTY_CARDS: Card[] = [];

/**
 * CodebreakerStageBoard - allows card interactions for guessing
 * OPTIMIZED: Fixed callback dependencies and memoized cards array
 */
export const CodebreakerStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { handleMakeGuess, currentStage, isLoading } = useGameplayContext();

    // STABLE EMPTY ARRAY: Prevents new references on every render
    const cards = useMemo(() => {
      return gameData.currentRound?.cards ?? EMPTY_CARDS;
    }, [gameData.currentRound?.cards]);

    const handleCardClick = useCallback(
      (cardWord: string) => {
        const roundNumber = gameData.currentRound?.roundNumber;
        if (!roundNumber) return;

        handleMakeGuess(roundNumber, cardWord);
      },
      [handleMakeGuess, gameData.currentRound?.roundNumber],
    );

    return (
      <RenderCards
        cards={cards}
        stage={currentStage}
        onCardClick={handleCardClick}
        disabled={isLoading.makeGuess}
      />
    );
  },
);

/**
 * CodemasterStageBoard - shows all card colors for giving clues
 */
export const CodemasterStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { currentStage } = useGameplayContext();

    // STABLE EMPTY ARRAY: Prevents new references on every render
    const cards = useMemo(() => {
      return gameData.currentRound?.cards ?? EMPTY_CARDS;
    }, [gameData.currentRound?.cards]);

    return (
      <RenderCards
        cards={cards}
        stage={currentStage}
        showCodemasterView={true}
        onCardClick={undefined}
        disabled={false}
      />
    );
  },
);

/**
 * ReadOnlyBoard - no interactions, just display
 */
export const ReadOnlyBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { currentStage } = useGameplayContext();

    // STABLE EMPTY ARRAY: Prevents new references on every render
    const cards = useMemo(() => {
      return gameData.currentRound?.cards ?? EMPTY_CARDS;
    }, [gameData.currentRound?.cards]);

    return (
      <RenderCards
        cards={cards}
        stage={currentStage}
        readOnly={true}
        onCardClick={undefined}
        disabled={false}
      />
    );
  },
);
