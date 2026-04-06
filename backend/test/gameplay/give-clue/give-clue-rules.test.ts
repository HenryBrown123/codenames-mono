/**
 * Tests for clue validation rules (give-clue.rules.ts)
 *
 * validateClueWord is a pure function on GameAggregate — no mocks needed.
 * It enforces official Codenames rules about forbidden clue words.
 */
import { describe, it, expect, beforeEach } from "@jest/globals";
import { validateClueWord } from "@backend/game/gameplay/turns/clue/give-clue.rules";
import { buildGameAggregate, buildCard, buildTurn, buildRound, resetIds } from "../../__test-utils__/fixtures";

describe("validateClueWord", () => {
  beforeEach(() => resetIds());

  const gameWithCards = (...words: string[]) => {
    const cards = words.map((word) => buildCard({ word }));
    return buildGameAggregate({
      currentRound: buildRound({
        cards,
        turns: [],
        players: [],
      }),
    });
  };

  it("rejects clue that exactly matches a board word (case-insensitive)", () => {
    const game = gameWithCards("APPLE", "BANANA", "CAR");
    expect(validateClueWord(game, "apple")).toEqual({
      valid: false,
      error: expect.stringContaining("matches a card word"),
    });
  });

  it("rejects clue that was already used this round", () => {
    const game = buildGameAggregate({
      currentRound: buildRound({
        cards: [buildCard({ word: "APPLE" })],
        turns: [
          buildTurn({
            clue: { _id: 1, _turnId: 1, word: "FRUIT", number: 2, createdAt: new Date() },
          }),
        ],
        players: [],
      }),
    });

    expect(validateClueWord(game, "fruit")).toEqual({
      valid: false,
      error: expect.stringContaining("already been used"),
    });
  });

  it("rejects clue containing a board word as substring", () => {
    const game = gameWithCards("APPLE", "BANANA");
    // "pineapple" contains "apple"
    expect(validateClueWord(game, "pineapple")).toEqual({
      valid: false,
      error: expect.stringContaining("too similar"),
    });
  });

  it("rejects clue that is a substring of a board word", () => {
    const game = gameWithCards("CARPET", "DOOR");
    // "car" is contained within "carpet"
    expect(validateClueWord(game, "car")).toEqual({
      valid: false,
      error: expect.stringContaining("too similar"),
    });
  });

  it("accepts a valid unrelated clue word", () => {
    const game = gameWithCards("APPLE", "BANANA", "CAR");
    expect(validateClueWord(game, "technology")).toEqual({ valid: true });
  });

  it("returns error when no cards available (no current round)", () => {
    const game = buildGameAggregate({ currentRound: null });
    expect(validateClueWord(game, "anything")).toEqual({
      valid: false,
      error: expect.stringContaining("No cards available"),
    });
  });
});
