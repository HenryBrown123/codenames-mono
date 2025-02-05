/// <reference types="cypress" />
import GameBoard from "@game/components/game-board/game-board"; // Replace with your actual component path
import styled from "styled-components";
import chaiColors from "chai-colors";
chai.use(chaiColors);

import {
  exampleIntroGameState,
  exampleCodemasterStage,
  exampleCodebreakerStage,
} from "@test/mock-game-data";

describe("GameBoard Component", () => {
  const Wrapper = styled.div`
    width: 500px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  `;

  it("renders all game cards and checks visibility", () => {
    cy.mount(
      <Wrapper>
        <GameBoard gameData={exampleIntroGameState} />
      </Wrapper>
    );
    exampleIntroGameState.state.cards.forEach((card) => {
      cy.contains(card.word).should("be.visible");
    });
  });

  it("does not place a covering card when cards are clicked in intro stage", () => {
    cy.mount(
      <Wrapper>
        <GameBoard gameData={exampleIntroGameState} />
      </Wrapper>
    );

    exampleIntroGameState.state.cards
      .filter(
        (card) =>
          !card.selected && exampleIntroGameState.state.stage === "intro"
      )
      .forEach((card) => {
        cy.contains(card.word).click();
        cy.get('[aria-label="Selected card"]').should("not.exist");
      });
  });

  it("renders cards with correct background color for TEAM.ASSASSIN only in codemaster view", () => {
    cy.mount(
      <Wrapper>
        <GameBoard
          gameData={exampleCodemasterStage}
          flipUnselectedCards={true}
        />
      </Wrapper>
    );

    cy.contains("strawberry")
      .closest("button")
      .should("exist")
      .should("have.css", "background-color")
      .should("be.colored", "#1d2023");
  });

  it("renders cards with correct background color for TEAM.BYSTANDER only in codemaster view", () => {
    cy.mount(
      <Wrapper>
        <GameBoard
          gameData={exampleCodemasterStage}
          flipUnselectedCards={true}
        />
      </Wrapper>
    );

    cy.contains("umbrella")
      .closest("button")
      .invoke("css", "background-color")
      .should("be.colored", "#4169E1");
  });

  it("renders cards with correct background color for TEAM.RED only in codemaster view", () => {
    cy.mount(
      <Wrapper>
        <GameBoard
          gameData={exampleCodemasterStage}
          flipUnselectedCards={true}
        />
      </Wrapper>
    );

    cy.contains("banana")
      .closest("button")
      .invoke("css", "background-color")
      .should("be.colored", "#B22222");
  });

  it("renders cards with correct background color for TEAM.GREEN only in codemaster view", () => {
    cy.mount(
      <Wrapper>
        <GameBoard
          gameData={exampleCodemasterStage}
          flipUnselectedCards={true}
        />
      </Wrapper>
    );

    cy.contains("hazelnut")
      .closest("button")
      .invoke("css", "background-color")
      .should("be.colored", "#228B22");
  });

  it("renders selected cards with a cover", () => {
    cy.mount(
      <Wrapper>
        <GameBoard gameData={exampleCodebreakerStage} />
      </Wrapper>
    );

    exampleCodebreakerStage.state.cards
      .filter((card) => card.selected)
      .forEach((card) => {
        cy.contains(card.word)
          .parent()
          .within(() => {
            cy.get('[aria-label="Selected card"]').should("exist");
          });
      });
  });

  it("allows clicking on unselected cards in codebreaker stage", () => {
    cy.mount(
      <Wrapper>
        <GameBoard gameData={exampleCodebreakerStage} />
      </Wrapper>
    );

    exampleCodebreakerStage.state.cards
      .filter(
        (card) =>
          !card.selected &&
          exampleCodebreakerStage.state.stage === "codebreaker"
      )
      .forEach((card) => {
        cy.contains(card.word).click();
        cy.get('[aria-label="Selected card"]').should("exist");
      });
  });
});
