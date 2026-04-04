import type { Card } from "../../../shared-types";

/**
 * Validates a clue word against board rules:
 * - Must not be empty
 * - Must not match any card word on the board
 *
 * @returns Error message string, or null if valid
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
