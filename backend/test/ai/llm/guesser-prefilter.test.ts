/**
 * Tests for guesser prefilter pure functions (guesser-prefilter.ts)
 *
 * Prompt builders and validation type guards.
 */
import { describe, it, expect } from "@jest/globals";
import {
  buildBatchPreFilterPrompt,
  buildPreFilterPrompt,
  isValidPreFilterResult,
} from "@backend/ai/llm/guesser-prefilter";

describe("buildBatchPreFilterPrompt", () => {
  it("includes all words in numbered list", () => {
    const prompt = buildBatchPreFilterPrompt("orbit", ["JUPITER", "MOON", "HAMMER"]);
    expect(prompt).toContain("1. JUPITER");
    expect(prompt).toContain("2. MOON");
    expect(prompt).toContain("3. HAMMER");
  });

  it("includes the clue word", () => {
    const prompt = buildBatchPreFilterPrompt("orbit", ["JUPITER"]);
    expect(prompt).toContain('"orbit"');
  });
});

describe("buildPreFilterPrompt", () => {
  it("includes clue and word", () => {
    const prompt = buildPreFilterPrompt({ clueWord: "orbit", word: "JUPITER" });
    expect(prompt).toContain('"orbit"');
    expect(prompt).toContain('"JUPITER"');
  });
});

describe("isValidPreFilterResult", () => {
  it("accepts valid result with all fields", () => {
    expect(
      isValidPreFilterResult({
        word: "JUPITER",
        link_confidence: "extremely",
        reason: "orbiting planet",
      }),
    ).toBe(true);
  });

  it("accepts 'no link' confidence", () => {
    expect(
      isValidPreFilterResult({
        word: "HAMMER",
        link_confidence: "no link",
        reason: "no connection",
      }),
    ).toBe(true);
  });

  it("rejects invalid link_confidence value", () => {
    expect(
      isValidPreFilterResult({
        word: "HAMMER",
        link_confidence: "somewhat",
        reason: "maybe",
      }),
    ).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidPreFilterResult(null)).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(isValidPreFilterResult({ word: "TEST" })).toBe(false);
  });
});
