import { describe, it, expect } from "vitest";
import { validateClueWord } from "@frontend/game/gameplay/dashboard/compact-dashboard/clue-validation";
import type { Card } from "@frontend/shared/types";

const card = (word: string): Card => ({
  word,
  selected: false,
  teamName: "Red",
  cardType: "TEAM",
});

describe("validateClueWord", () => {
  const cards = [card("APPLE"), card("BANANA"), card("CAR")];

  it("returns error for empty input", () => {
    expect(validateClueWord("", cards)).toBe("INTEL REQUIRED");
  });

  it("returns error for whitespace-only input", () => {
    expect(validateClueWord("   ", cards)).toBe("INTEL REQUIRED");
  });

  it("returns error when clue matches a board word (case-insensitive)", () => {
    expect(validateClueWord("apple", cards)).toBe("CANNOT USE BOARD WORD");
    expect(validateClueWord("APPLE", cards)).toBe("CANNOT USE BOARD WORD");
  });

  it("returns null for valid unrelated word", () => {
    expect(validateClueWord("technology", cards)).toBeNull();
  });

  it("returns null when cards array is empty", () => {
    expect(validateClueWord("anything", [])).toBeNull();
  });
});
