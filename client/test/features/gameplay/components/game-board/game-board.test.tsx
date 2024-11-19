import { render, fireEvent, waitFor } from "@testing-library/react";
import {
  CodemasterStageBoard,
  CodebreakerStageBoard,
  ReadOnlyBoard,
  DefaultStageBoard,
} from "@game/components/game-board/game-board-views";
import {
  exampleIntroGameState,
  exampleCodemasterStage,
  exampleCodebreakerStageCorrectTeamCard,
  exampleCodebreakerStage,
} from "@test/mock-game-data";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameplayContextProvider } from "@game/context";
import { useState } from "react";

const queryClient = new QueryClient();

// Wrapper component for testing prop updates
const WrapperComponent = ({ initialGameData }) => {
  const [gameData, setGameData] = useState(initialGameData);

  return (
    <QueryClientProvider client={queryClient}>
      <GameplayContextProvider currentGameStage={gameData.state.stage}>
        <CodebreakerStageBoard gameData={gameData} />
        <button
          onClick={() => setGameData(exampleCodebreakerStageCorrectTeamCard)}
        >
          Update Game Data
        </button>
      </GameplayContextProvider>
    </QueryClientProvider>
  );
};

describe("GameBoard Components for Different Stages", () => {
  it("renders all game cards in the Intro stage (ReadOnlyBoard)", () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <GameplayContextProvider
          currentGameStage={exampleIntroGameState.state.stage}
        >
          <ReadOnlyBoard gameData={exampleIntroGameState} />
        </GameplayContextProvider>
      </QueryClientProvider>
    );
    exampleIntroGameState.state.cards.forEach((card) => {
      expect(getByText(card.word)).not.toBeNull();
    });
  });

  it("allows clicking on the 'banana' card in Codebreaker stage, and a cover card appears", async () => {
    const gameData = exampleCodebreakerStage;
    const { getByText, getAllByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <GameplayContextProvider currentGameStage={gameData.state.stage}>
          <CodebreakerStageBoard gameData={gameData} />
        </GameplayContextProvider>
      </QueryClientProvider>
    );

    const selectedCardsBeforeClick = getAllByLabelText("Selected card").length;
    fireEvent.click(getByText("banana"));

    await waitFor(() => {
      const selectedCardsAfterClick = getAllByLabelText("Selected card").length;
      expect(selectedCardsAfterClick).toBe(selectedCardsBeforeClick + 1);
    });
  });

  it("does not allow clicking on cards in Codemaster stage (CodemasterStageBoard)", async () => {
    const gameData = exampleCodemasterStage;
    const { getByText, getAllByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <GameplayContextProvider currentGameStage={gameData.state.stage}>
          <CodemasterStageBoard gameData={gameData} />
        </GameplayContextProvider>
      </QueryClientProvider>
    );
    for (const card of gameData.state.cards) {
      const selectedCardsBeforeClick =
        getAllByLabelText("Selected card").length;
      fireEvent.click(getByText(card.word));
      await waitFor(() => {
        const selectedCardsAfterClick =
          getAllByLabelText("Selected card").length;
        expect(selectedCardsAfterClick).toBe(selectedCardsBeforeClick);
      });
    }
  });

  it("renders selected cards as selected in Codebreaker stage", () => {
    const gameData = exampleCodebreakerStageCorrectTeamCard;
    const { getByText, getAllByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <GameplayContextProvider currentGameStage={gameData.state.stage}>
          <CodebreakerStageBoard gameData={gameData} />
        </GameplayContextProvider>
      </QueryClientProvider>
    );
    gameData.state.cards
      .filter((card) => card.selected)
      .forEach((card) => {
        const selectedCards = getAllByLabelText("Selected card");
        const matchingCard = selectedCards.find(
          (el) => el.textContent === card.word
        );
        expect(matchingCard).not.toBeNull();
      });
  });

  it("renders all game cards in the Default stage (DefaultStageBoard) without interaction", () => {
    const gameData = exampleIntroGameState;
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <GameplayContextProvider currentGameStage={gameData.state.stage}>
          <DefaultStageBoard gameData={gameData} />
        </GameplayContextProvider>
      </QueryClientProvider>
    );
    gameData.state.cards.forEach((card) => {
      expect(getByText(card.word)).not.toBeNull();
    });
  });
});
