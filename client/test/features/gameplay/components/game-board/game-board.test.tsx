// Tests for the GameBoard component
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import GameBoard from "@game/components/game-board/game-board";
import { TEAM, STAGE } from "@game/game-common-constants";
import {
  exampleIntroGameState,
  exampleCodemasterStage,
  exampleCodebreakerStage,
} from "@test/mock-game-data";

import { describe, it, expect } from "vitest";

describe("GameBoard Component", () => {
  it("renders all game cards", () => {
    const { getByText } = render(
      <GameBoard gameData={exampleIntroGameState} />
    );
    exampleIntroGameState.state.cards.forEach((card) => {
      expect(getByText(card.word)).not.toBeNull();
    });
  });

  it("allows clicking on unselected cards in codebreaker stage, and a cover card appears", () => {
    const gameData = exampleCodebreakerStage;
    const { getByText, getAllByLabelText } = render(
      <GameBoard gameData={gameData} />
    );
    gameData.state.cards
      .filter((card) => !card.selected)
      .forEach((card) => {
        const selectedCardsBeforeClick =
          getAllByLabelText("Selected card").length;
        fireEvent.click(getByText(card.word));
        const selectedCardsAfterClick =
          getAllByLabelText("Selected card").length;
        expect(selectedCardsAfterClick).toBe(selectedCardsBeforeClick + 1);
      });
  });

  it("does not allow clicking on cards in codemaster stage", () => {
    const gameData = exampleCodemasterStage;
    const { getByText, getAllByLabelText } = render(
      <GameBoard gameData={gameData} />
    );
    gameData.state.cards.forEach((card) => {
      const selectedCardsBeforeClick =
        getAllByLabelText("Selected card").length;
      fireEvent.click(getByText(card.word));
      const selectedCardsAfterClick = getAllByLabelText("Selected card").length;
      expect(selectedCardsAfterClick).toBe(selectedCardsBeforeClick);
    });
  });

  it("renders selected cards as selected", () => {
    const gameData = exampleCodebreakerStage;
    const { getByText, getAllByLabelText } = render(
      <GameBoard gameData={gameData} />
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
});
