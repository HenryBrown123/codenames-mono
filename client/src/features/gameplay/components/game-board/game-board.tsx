import React, { useCallback, useState } from "react";
import styled from "styled-components";
import GameCard from "./game-card";
import { STAGE } from "@game/game-common-constants";
import { GameData, Card, Stage } from "@game/game-common-types";
import { useProcessTurn } from "@game/api";
import { useGameplayContext } from "@game/context";
import { getGameCardProps } from "./game-board-utils";

const Grid = styled.div`
  height: calc(100% - 50px); // Adjust to leave space for the dashboard
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardsContainer = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-gap: 0.2em;
  align-items: stretch;
  justify-items: stretch;
`;

const GameCardContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Reusable card rendering logic

type RenderCardsProps = {
  cards: Card[];
  stage: Stage;
  readOnly?: boolean;
  handleCardClick?: (cardData: Card) => void;
};

const RenderCards: React.FC<RenderCardsProps> = ({
  cards,
  stage,
  readOnly,
  handleCardClick,
}) => (
  <CardsContainer aria-label="game board container with 25 cards">
    {cards.map((cardData) => {
      const gameCardProps = getGameCardProps(cardData, stage, readOnly, () =>
        handleCardClick(cardData)
      );
      return (
        <GameCardContainer
          aria-label={`card for word: ${cardData.word}`}
          key={cardData.word}
        >
          <GameCard {...gameCardProps} />
        </GameCardContainer>
      );
    })}
  </CardsContainer>
);

// Game board stages
const CodebreakerStageBoard: React.FC<{ gameData: GameData }> = ({
  gameData,
}) => {
  const { mutate: processTurn } = useProcessTurn();
  const { dispatch } = useGameplayContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardClick = useCallback(
    (cardData: Card) => {
      if (!cardData.selected && !isProcessing) {
        setIsProcessing(true);

        // Update the selected card
        const updatedCards = gameData.state.cards.map((card) =>
          card.word === cardData.word
            ? { ...card, selected: true }
            : { ...card }
        );

        // Add the guessed word to the last round's turns
        const updatedRounds = [...gameData.state.rounds];
        const lastRound = updatedRounds.at(-1);

        if (lastRound) {
          lastRound.turns = [
            ...(lastRound.turns || []),
            { guessedWord: cardData.word },
          ];
        }

        // Update the game state
        const updatedGameState = {
          ...gameData.state,
          cards: updatedCards,
          rounds: updatedRounds,
        };

        processTurn(
          { gameId: gameData._id, gameState: updatedGameState },
          {
            onSuccess: (returnedGameState) => {
              setIsProcessing(false);

              if (updatedGameState.stage !== returnedGameState.stage) {
                dispatch({ type: "PAUSE_GAMEPLAY" });
              }
            },
          }
        );
      }
    },
    [gameData, isProcessing, processTurn]
  );

  return (
    <RenderCards
      cards={gameData.state.cards}
      stage={gameData.state.stage}
      handleCardClick={handleCardClick}
    />
  );
};

const CodemasterStageBoard: React.FC<{ gameData: GameData }> = ({
  gameData,
}) => (
  <RenderCards
    cards={gameData.state.cards}
    stage={gameData.state.stage}
    handleCardClick={() => {}}
  />
);

const ReadOnlyBoard: React.FC<{ gameData: GameData }> = ({ gameData }) => (
  <RenderCards
    cards={gameData.state.cards}
    stage={gameData.state.stage}
    readOnly={true}
    handleCardClick={() => {}}
  />
);

const DefaultStageBoard: React.FC<{ gameData: GameData }> = ({ gameData }) => (
  <RenderCards
    cards={gameData.state.cards}
    stage={gameData.state.stage}
    handleCardClick={() => {}}
  />
);

// Main GameBoard component
interface GameBoardProps {
  gameData: GameData;
  readOnly: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameData, readOnly }) => {
  if (readOnly) {
    return (
      <Grid aria-label="game board wrapper">
        <ReadOnlyBoard gameData={gameData} />
      </Grid>
    );
  }
  return (
    <Grid aria-label="game board wrapper">
      {gameData.state.stage === STAGE.CODEBREAKER && (
        <CodebreakerStageBoard gameData={gameData} />
      )}
      {gameData.state.stage === STAGE.CODEMASTER && (
        <CodemasterStageBoard gameData={gameData} />
      )}
      {gameData.state.stage !== STAGE.CODEBREAKER &&
        gameData.state.stage !== STAGE.CODEMASTER && (
          <DefaultStageBoard gameData={gameData} />
        )}
    </Grid>
  );
};

export default GameBoard;
