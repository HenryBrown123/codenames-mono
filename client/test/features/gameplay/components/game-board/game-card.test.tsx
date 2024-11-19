import { render, screen, fireEvent } from "@testing-library/react";
import GameCard from "@game/components/game-board/game-card"; // Replace with your actual component path
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach } from "vitest";

let gameCardProps;

beforeEach(() => {
  gameCardProps = {
    cardText: "Test Card",
    cardColor: "#B22222",
    clickable: true,
    selected: false,
    codemasterView: false,
  };
});

describe("GameCard Component", () => {
  it("displays the required text on the card", () => {
    render(<GameCard {...gameCardProps} />);

    const cardElement = screen.getByText(/Test Card/i);
    expect(cardElement).toBeInTheDocument();
  });

  it("does not display the cover card when the card is not selected", () => {
    render(<GameCard {...gameCardProps} />);

    const coverCardElement = screen.queryByLabelText(/Selected card/i);
    expect(coverCardElement).not.toBeInTheDocument();
  });

  it("displays the cover card when the card is selected", () => {
    render(<GameCard {...gameCardProps} selected={true} />);

    const coverCardElement = screen.getByLabelText(/Selected card/i);
    expect(coverCardElement).toBeInTheDocument();
  });
});
