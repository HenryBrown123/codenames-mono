/**
 * Tests for card distribution logic (deal-cards.actions.ts)
 *
 * allocateInitialCardTypes is a pure function encoding the 9-8-1-7=25 card invariant.
 */
import { describe, it, expect } from "@jest/globals";
import { allocateInitialCardTypes } from "@backend/lobby/deal-cards/deal-cards.actions";
import { CARD_TYPE } from "@backend/common/data-access/repositories/cards.repository";

describe("allocateInitialCardTypes", () => {
  const startingTeam = 1;
  const otherTeam = 2;

  const cards = allocateInitialCardTypes(startingTeam, otherTeam);

  it("produces exactly 25 cards", () => {
    expect(cards).toHaveLength(25);
  });

  it("starting team gets 9 cards", () => {
    const startingCards = cards.filter(
      (c) => c.cardType === CARD_TYPE.TEAM && c.teamId === startingTeam,
    );
    expect(startingCards).toHaveLength(9);
  });

  it("other team gets 8 cards", () => {
    const otherCards = cards.filter(
      (c) => c.cardType === CARD_TYPE.TEAM && c.teamId === otherTeam,
    );
    expect(otherCards).toHaveLength(8);
  });

  it("has exactly 1 assassin card", () => {
    const assassins = cards.filter((c) => c.cardType === CARD_TYPE.ASSASSIN);
    expect(assassins).toHaveLength(1);
  });

  it("has exactly 7 bystander cards", () => {
    const bystanders = cards.filter((c) => c.cardType === CARD_TYPE.BYSTANDER);
    expect(bystanders).toHaveLength(7);
  });
});
