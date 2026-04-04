/**
 * Tests for make-guess validation rules (make-guess.rules.ts)
 *
 * validateTurnForGuessing is a pure function — no mocks needed.
 */
import { describe, it, expect } from "@jest/globals";
import { validateTurnForGuessing } from "@backend/gameplay/make-guess/make-guess.rules";
import { buildTurn } from "../../__test-utils__/fixtures";

describe("validateTurnForGuessing", () => {
  it("returns error for null turn", () => {
    const result = validateTurnForGuessing(null);
    expect(result).toEqual({ valid: false, error: "No active turn" });
  });

  it("returns error for COMPLETED turn", () => {
    const turn = buildTurn({ status: "COMPLETED" });
    const result = validateTurnForGuessing(turn);
    expect(result).toEqual({ valid: false, error: "Turn is not active" });
  });

  it("returns error when no clue given", () => {
    const turn = buildTurn({ clue: undefined });
    const result = validateTurnForGuessing(turn);
    expect(result).toEqual({ valid: false, error: "No clue given yet" });
  });

  it("returns error when 0 guesses remaining", () => {
    const turn = buildTurn({
      guessesRemaining: 0,
      clue: { _id: 1, _turnId: 1, word: "FRUIT", number: 2, createdAt: new Date() },
    });
    const result = validateTurnForGuessing(turn);
    expect(result).toEqual({ valid: false, error: "No guesses remaining" });
  });

  it("returns valid for active turn with clue and guesses", () => {
    const turn = buildTurn({
      status: "ACTIVE",
      guessesRemaining: 2,
      clue: { _id: 1, _turnId: 1, word: "FRUIT", number: 2, createdAt: new Date() },
    });
    const result = validateTurnForGuessing(turn);
    expect(result).toEqual({ valid: true });
  });
});
