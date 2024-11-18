import React, { useCallback, useState } from "react";
import { useProcessTurn } from "@game/api";
import { useGameplayContext } from "@game/context";
import { GameData, Card } from "@game/game-common-types";
import { RenderCards } from "./game-board-utils";

/**
 * CodebreakerStageBoard component renders the game board for the codebreaker stage.
 * It allows cards to be picked by the codebreaker which in then calls processTurn to evaluate choice..
 */
export const CodebreakerStageBoard: React.FC<{ gameData: GameData }> = ({
  gameData,
}) => {
  const { mutate: processTurn } = useProcessTurn();
  const { dispatch } = useGameplayContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardClick = useCallback(
    (cardData: Card) => {
      if (!cardData.selected && !isProcessing) {
        setIsProcessing(true);

        const updatedCards = gameData.state.cards.map((card) =>
          card.word === cardData.word
            ? { ...card, selected: true }
            : { ...card }
        );

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
          cards: updatedCards,
          rounds: updatedRounds,
        };

        processTurn(
          { gameId: gameData._id, gameState: updatedGameState },
          {
            onSuccess: () => {
              setIsProcessing(false);
            },
          }
        );
      }
    },
    [gameData, isProcessing, processTurn, dispatch]
  );

  return (
    <RenderCards
      cards={gameData.state.cards}
      stage={gameData.state.stage}
      handleCardClick={handleCardClick}
    />
  );
};

/**
 * CodemasterStageBoard component renders the game board for the codemaster stage.
 * It does not allow card interactions but does show the actual colour of the cards.
 */
export const CodemasterStageBoard: React.FC<{ gameData: GameData }> = ({
  gameData,
}) => (
  <RenderCards
    cards={gameData.state.cards}
    stage={gameData.state.stage}
    handleCardClick={() => {}}
  />
);

/**
 * ReadOnlyBoard component renders the game board in a read-only state.
 * It does not allow any interactions with the cards.
 */
export const ReadOnlyBoard: React.FC<{ gameData: GameData }> = ({
  gameData,
}) => (
  <RenderCards
    cards={gameData.state.cards}
    stage={gameData.state.stage}
    readOnly={true}
    handleCardClick={() => {}}
  />
);

/**
 * DefaultStageBoard component renders the game board for stages that do not have specific interactions.
 */
export const DefaultStageBoard: React.FC<{ gameData: GameData }> = ({
  gameData,
}) => (
  <RenderCards
    cards={gameData.state.cards}
    stage={gameData.state.stage}
    handleCardClick={() => {}}
  />
);
