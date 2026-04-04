import { useState, useCallback } from "react";
import type { Card } from "../../../shared-types";
import { validateClueWord } from "./clue-validation";

export interface ClueInputState {
  word: string;
  count: number;
  error: string;
  setWord: (w: string) => void;
  setCount: (n: number) => void;
  /** Validates and returns true if valid. Sets error message if not. */
  validate: () => boolean;
  /** Resets all fields to defaults. */
  reset: () => void;
}

/**
 * Manages clue input state + validation for the compact dashboard.
 * Keeps word, count, and error colocated so callers don't juggle three useState calls.
 */
export function useClueInput(cards: Card[]): ClueInputState {
  const [word, setWordRaw] = useState("");
  const [count, setCount] = useState(1);
  const [error, setError] = useState("");

  const setWord = useCallback((w: string): void => {
    setWordRaw(w);
    setError("");
  }, []);

  const validate = useCallback((): boolean => {
    const validationError = validateClueWord(word, cards);
    if (validationError) {
      setError(validationError);
      return false;
    }
    setError("");
    return true;
  }, [word, cards]);

  const reset = useCallback((): void => {
    setWordRaw("");
    setCount(1);
    setError("");
  }, []);

  return { word, count, error, setWord, setCount, validate, reset };
}
