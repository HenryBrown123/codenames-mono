/// <reference types="cypress" />
import React from "react";
import GameCard from "@game/components/game-board/game-card"; // Replace with your actual component path
import styled from "styled-components";

describe("GameCard Component", () => {
  let gameCardProps;

  const Wrapper = styled.div`
    width: 200px;
    height: 65px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  `;

  beforeEach(() => {
    gameCardProps = {
      cardText: "Test Card",
      cardColor: "#B22222",
      clickable: true,
      selected: false,
      codemasterView: false,
    };
  });

  it("displays the required text on the card", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} />
      </Wrapper>
    );
    cy.get("div")
      .contains(/Test Card/i)
      .should("exist")
      .should("be.visible");
  });

  it("does not display the cover card when the card is not selected", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} />
      </Wrapper>
    );
    cy.get('[aria-label="Selected card"]').should("not.exist");
  });

  it("displays the cover card when the card is selected", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} selected={true} />
      </Wrapper>
    );
    cy.get('[aria-label="Selected card"]').should("exist");
  });

  it("displays the cover card after the card is clicked", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} />
      </Wrapper>
    );
    cy.contains(/Test Card/i).click();
    cy.get('[aria-label="Selected card"]').should("exist");
  });

  it("applies strikethrough to text when the card is selected", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} selected={true} />
      </Wrapper>
    );
    cy.contains("Test Card")
      .parent()
      .within(() => {
        cy.get("div")
          .invoke("css", "text-decoration")
          .should("include", "line-through");
      });
  });

  it("does not apply strikethrough to text when the card is not selected", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} selected={false} />
      </Wrapper>
    );
    cy.contains("Test Card")
      .parent()
      .within(() => {
        cy.get("div")
          .invoke("css", "text-decoration")
          .should("not.include", "line-through");
      });
  });

  it("maintains the selected state after clicking the card text again", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} selected={true} />
      </Wrapper>
    );

    cy.contains(/Test Card/i).click();

    // Assert that the card still has the "selected" state after attempting to click it again
    cy.get('[aria-label="Selected card"]').should("exist");
  });

  it("maintains the selected state after clicking the cover card", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} selected={true} />
      </Wrapper>
    );
    cy.get('[aria-label="Selected card"]').click();

    // Assert that the cover card is still visible after attempting to click it
    cy.get('[aria-label="Selected card"]').should("exist");
  });

  it("checks if the cover card is on top of the text card", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} selected={true} />
      </Wrapper>
    );

    // Wait for the cover card animation to complete
    cy.wait(1000);

    cy.get('[aria-label="Selected card"]')
      .should("be.visible")
      .then(($coverCard) => {
        const coverCardRect = (
          $coverCard[0] as HTMLElement
        ).getBoundingClientRect();
        cy.contains(/Test Card/i)
          .should("be.visible")
          .then(($textCard) => {
            if ($textCard && $textCard[0]) {
              const textCardRect = (
                $textCard[0] as HTMLElement
              ).getBoundingClientRect();

              // Check that the cover card fully overlaps the text card
              expect(coverCardRect.top).to.be.lte(textCardRect.top);
              expect(coverCardRect.left).to.be.lte(textCardRect.left);
              expect(coverCardRect.right).to.be.gte(textCardRect.right);
              expect(coverCardRect.bottom).to.be.gte(textCardRect.bottom);

              // Additionally, use elementFromPoint to verify the cover card is the topmost element
              const centerX = (textCardRect.left + textCardRect.right) / 2;
              const centerY = (textCardRect.top + textCardRect.bottom) / 2;
              const topElement = document.elementFromPoint(centerX, centerY);
              expect(topElement).to.equal($coverCard[0]);
            }
          });
      });
  });

  it("applies the correct background color in codemaster view", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} codemasterView={true} />
      </Wrapper>
    );
    cy.contains("Test Card")
      .closest("button")
      .invoke("css", "background-color")
      .should("equal", "rgb(178, 34, 34)");
  });

  it("does not apply the background color when not in codemaster view", () => {
    cy.mount(
      <Wrapper>
        <GameCard {...gameCardProps} codemasterView={false} />
      </Wrapper>
    );
    cy.contains("Test Card")
      .closest("button")
      .invoke("css", "background-color")
      .should("not.equal", "rgb(178, 34, 34)");
  });
});
