import React, { useCallback, useMemo, memo } from "react";
import { useGameplayContext } from "@frontend/game/state";
import { GameData, Card } from "@frontend/shared-types";
import { RenderCards } from "./game-board-utils";

/**
 * CodebreakerStageBoard - allows card interactions for guessing
 * OPTIMIZED: Fixed callback dependencies and memoized cards array
 */
export const CodebreakerStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { handleMakeGuess, currentStage, isLoading } = useGameplayContext();

    // 🎯 FIX 1: Memoize the cards array to prevent new references
    const cards = useMemo(() => {
      return gameData.currentRound?.cards || [];
    }, [gameData.currentRound?.cards]);

    // 🎯 FIX 2: Simplified callback with stable dependencies
    const handleCardClick = useCallback(
      (cardWord: string) => {
        const roundNumber = gameData.currentRound?.roundNumber;
        if (!roundNumber) return;

        handleMakeGuess(roundNumber, cardWord);
      },
      [handleMakeGuess, gameData.currentRound?.roundNumber],
    );

    // 🎯 FIX 3: Don't pass the entire card object, just the word
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
 * OPTIMIZED: Memoized cards array, no callbacks needed
 */
export const CodemasterStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { currentStage } = useGameplayContext();

    // 🎯 FIX 1: Memoize the cards array
    const cards = useMemo(() => {
      return gameData.currentRound?.cards || [];
    }, [gameData.currentRound?.cards]);

    return (
      <RenderCards
        cards={cards}
        stage={currentStage}
        showCodemasterView={true}
        onCardClick={undefined} // No interaction for codemasters
        disabled={false}
      />
    );
  },
);

/**
 * ReadOnlyBoard - no interactions, just display
 * OPTIMIZED: Memoized cards array, no callbacks
 */
export const ReadOnlyBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { currentStage } = useGameplayContext();

    // 🎯 FIX 1: Memoize the cards array
    const cards = useMemo(() => {
      return gameData.currentRound?.cards || [];
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
