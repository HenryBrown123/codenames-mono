import React, { useCallback, useState, memo } from "react";
import { useGameplayContext } from "@frontend/game/state";
import { GameData, Card } from "@frontend/shared-types";
import { RenderCards } from "./game-board-utils";

/**
 * CodebreakerStageBoard - allows card interactions for guessing
 */
export const CodebreakerStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { handleMakeGuess, handleSceneTransition, currentStage, isLoading } =
      useGameplayContext();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCardClick = useCallback(
      (cardData: Card) => {
        if (!cardData.selected && !isProcessing && !isLoading.makeGuess) {
          if (!gameData.currentRound) return;

          setIsProcessing(true);

          // Make the guess - this will trigger scene transition in the mutation's onSuccess
          handleMakeGuess(gameData.currentRound.roundNumber, cardData.word);

          // Manually trigger UI transition to outcome scene
          handleSceneTransition("GUESS_MADE");

          setIsProcessing(false);
        }
      },
      [
        gameData.currentRound,
        isProcessing,
        isLoading.makeGuess,
        handleMakeGuess,
        handleSceneTransition,
      ],
    );

    return (
      <RenderCards
        cards={gameData.currentRound?.cards || []}
        stage={currentStage}
        handleCardClick={handleCardClick}
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

    return (
      <RenderCards
        cards={gameData.currentRound?.cards || []}
        stage={currentStage}
        showCodemasterView={true}
        handleCardClick={() => {}} // No interaction for codemasters
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

    return (
      <RenderCards
        cards={gameData.currentRound?.cards || []}
        stage={currentStage}
        readOnly={true}
        handleCardClick={() => {}}
      />
    );
  },
);
