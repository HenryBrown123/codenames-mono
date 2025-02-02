import React, { useCallback, useState, memo } from "react";
import { useProcessTurn } from "@frontend/game/api";
import { useGameplayContext } from "@frontend/game/state";
import { GameData, Card } from "@codenames/shared/src/game/game-types";
import { RenderCards } from "./game-board-utils";

/**
 * CodebreakerStageBoard component now just updates the rounds and calls handleProcessTurn.
 * The state machine transitions are controlled in the gameplay context's onSuccess handler.
 */
export const CodebreakerStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    const { handleTurnSubmission, uiStage } = useGameplayContext();
    const [isProcessing, setIsProcessing] = useState(false);

    console.log("Rendering codebreaker board");

    const handleCardClick = useCallback(
      (cardData: Card) => {
        if (!cardData.selected && !isProcessing) {
          setIsProcessing(true);

          const updatedRounds = [...gameData.state.rounds];
          const lastRound = updatedRounds.at(-1);

          if (lastRound) {
            lastRound.turns = [
              ...(lastRound.turns || []),
              { guessedWord: cardData.word },
            ];
          }

          const updatedGameState = {
            ...gameData.state,
            rounds: updatedRounds,
          };

          handleTurnSubmission(gameData._id, updatedGameState);
          setIsProcessing(false);
        }
      },
      [gameData, isProcessing, handleTurnSubmission],
    );

    return (
      <RenderCards
        cards={gameData.state.cards}
        stage={uiStage}
        handleCardClick={handleCardClick}
      />
    );
  },
);

/**
 * CodemasterStageBoard component renders the game board for the codemaster stage.
 * It does not allow card interactions but does show the actual colour of the cards.
 */
export const CodemasterStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    console.log("Rendering codemaster view");

    return (
      <RenderCards
        cards={gameData.state.cards}
        stage={gameData.state.stage}
        handleCardClick={() => {}}
      />
    );
  },
);

/**
 * ReadOnlyBoard component renders the game board in a read-only state.
 * It does not allow any interactions with the cards.
 */
export const ReadOnlyBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => {
    console.log("Rendering readonly view");

    return (
      <RenderCards
        cards={gameData.state.cards}
        stage={gameData.state.stage}
        readOnly={true}
        handleCardClick={() => {}}
      />
    );
  },
);

/**
 * DefaultStageBoard component renders the game board for stages that do not have specific interactions.
 */
export const DefaultStageBoard: React.FC<{ gameData: GameData }> = memo(
  ({ gameData }) => (
    <RenderCards
      cards={gameData.state.cards}
      stage={gameData.state.stage}
      handleCardClick={() => {}}
    />
  ),
);
