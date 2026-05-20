import type { Card } from "@frontend/shared/types";

/**
 * Pure validator for codemaster clue words.
 *
 * Returns a short uppercase error message for the submit button
 * (empty, board-word collision), or `null` when the clue passes.
 * Case-insensitive on the board-word check.
 */
export function validateClueWord(word: string, cards: Card[]): string | null {
  if (!word.trim()) {
    return "INTEL REQUIRED";
  }
  if (cards.some((c) => c.word.toLowerCase() === word.toLowerCase())) {
    return "CANNOT USE BOARD WORD";
  }
  return null;
}
