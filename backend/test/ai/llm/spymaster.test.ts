/**
 * Tests for spymaster pure functions (spymaster.ts)
 *
 * buildSpymasterPrompt is a pure prompt builder.
 * isWordFormOf is a linguistic rule for detecting word forms.
 */
import { describe, it, expect } from "@jest/globals";
import { buildSpymasterPrompt, isWordFormOf } from "@backend/ai/llm/spymaster";

describe("buildSpymasterPrompt", () => {
  const baseInput = {
    currentTeam: "Red",
    friendlyWords: ["APPLE", "BANANA", "CHERRY"],
    opponentWords: ["CAR", "DOOR"],
    neutralWords: ["EMPTY", "WALL"],
    assassinWord: "BOMB",
    previousClues: [],
  };

  it("includes all friendly words", () => {
    const prompt = buildSpymasterPrompt(baseInput);
    expect(prompt).toContain("APPLE, BANANA, CHERRY");
  });

  it("includes assassin word", () => {
    const prompt = buildSpymasterPrompt(baseInput);
    expect(prompt).toContain("Assassin: BOMB");
  });

  it("includes previous clues when present", () => {
    const prompt = buildSpymasterPrompt({
      ...baseInput,
      previousClues: ["FRUIT", "SWEET"],
    });
    expect(prompt).toContain("Already used clues");
    expect(prompt).toContain("FRUIT, SWEET");
  });

  it("omits previous clues section when empty", () => {
    const prompt = buildSpymasterPrompt(baseInput);
    expect(prompt).not.toContain("Already used clues");
  });
});

describe("isWordFormOf", () => {
  it("detects plural form (star → stars)", () => {
    expect(isWordFormOf("stars", ["STAR"])).toBe(true);
  });

  it("detects exact match case-insensitively", () => {
    expect(isWordFormOf("apple", ["APPLE"])).toBe(true);
  });

  it("rejects unrelated shorter word that doesn't start the longer", () => {
    expect(isWordFormOf("art", ["PARTY"])).toBe(false);
  });

  it("rejects words with no stem relationship", () => {
    expect(isWordFormOf("space", ["STAR"])).toBe(false);
  });

  it("detects suffix within 3 chars (break → breaking)", () => {
    expect(isWordFormOf("breaking", ["BREAK"])).toBe(true);
  });

  it("rejects if length difference exceeds 3 chars", () => {
    // "star" → "starlight" has 5 char diff, should be rejected
    expect(isWordFormOf("starlight", ["STAR"])).toBe(false);
  });
});
