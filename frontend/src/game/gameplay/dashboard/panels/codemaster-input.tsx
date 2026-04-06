import React, { useState, useEffect, useRef } from "react";
import { ActionButton, BUTTON_VALIDATION, type ButtonValidation, CircleButton } from "../../shared/components";
import { useGameDataRequired } from "../../providers";
import { Card } from "@frontend/shared/types";
import styles from "./codemaster-input.module.css";

/**
 * Form input for codemaster to submit clue and number
 */

type CodeWordInputProps = {
  codeWord?: string;
  numberOfCards: number | null;
  isEditable?: boolean;
  isLoading?: boolean;
  onSubmit?: (codeWord: string, numberOfCards: number) => void;
};

export function CodeWordInput({
  codeWord = "",
  numberOfCards,
  isEditable = true,
  isLoading = false,
  onSubmit,
}: CodeWordInputProps) {
  const { gameData } = useGameDataRequired();
  const [inputCodeWord, setInputCodeWord] = useState(codeWord);
  const [inputNumberOfCards, setInputNumberOfCards] = useState<number>(numberOfCards || 1);
  const [errorMessage, setErrorMessage] = useState("");
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width:768px)").matches;
    if (isEditable && textInputRef.current && !isMobile) {
      textInputRef.current.focus();
    }
  }, [isEditable]);

  useEffect(() => {
    setInputCodeWord(codeWord);
    setInputNumberOfCards(numberOfCards || 1);
  }, [codeWord, numberOfCards]);

  // Clear error when input changes
  const handleInputChange = (value: string) => {
    setInputCodeWord(value);
    if (errorMessage) setErrorMessage("");
  };

  const validateAndSubmit = () => {
    if (!onSubmit || !inputCodeWord.trim()) return;

    const cards: Card[] = gameData.currentRound?.cards || [];
    if (cards.some((c) => c.word.toLowerCase() === inputCodeWord.toLowerCase())) {
      setErrorMessage("Clue cannot match a board word");
      return;
    }
    if (inputNumberOfCards < 1 || inputNumberOfCards > 9) {
      setErrorMessage("Number must be 1-9");
      return;
    }
    setErrorMessage("");
    onSubmit(inputCodeWord, inputNumberOfCards);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isEditable && !isLoading && inputCodeWord.trim()) {
      validateAndSubmit();
    }
  };
  const decrement = () => setInputNumberOfCards((n) => Math.max(1, n - 1));
  const increment = () => setInputNumberOfCards((n) => Math.min(9, n + 1));

  // Determine button state
  const isEmpty = !inputCodeWord.trim();
  const hasError = errorMessage.length > 0;
  const canSubmit = !isEmpty && !hasError && !isLoading && isEditable;

  // Button text and validation state
  const getButtonState = (): { text: string; validation?: ButtonValidation } => {
    if (isLoading) return { text: "TRANSMITTING..." };
    if (hasError) return { text: errorMessage, validation: BUTTON_VALIDATION.ERROR };
    if (isEmpty) return { text: "ENTER CODEWORD", validation: BUTTON_VALIDATION.WARNING };
    return { text: "SUBMIT", validation: BUTTON_VALIDATION.OK };
  };

  const buttonState = getButtonState();

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          id="clue-word-input"
          ref={textInputRef}
          type="text"
          value={inputCodeWord}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isEditable || isLoading}
          data-error={hasError}
          placeholder="CODEWORD"
          autoComplete="off"
          className={styles.codeWordInputField}
        />
        <div className={styles.numberInput}>
          <CircleButton onClick={decrement} disabled={!isEditable || isLoading || inputNumberOfCards <= 1} aria-label="Decrease clue count">-</CircleButton>
          <div id="clue-number" className={styles.numberDisplay}>{inputNumberOfCards}</div>
          <CircleButton onClick={increment} disabled={!isEditable || isLoading || inputNumberOfCards >= 9} aria-label="Increase clue count">+</CircleButton>
        </div>
      </div>

      {isEditable && (
        <ActionButton
          id="submit-clue-btn"
          onClick={validateAndSubmit}
          text={isEmpty ? "SUBMIT" : buttonState.text}
          enabled={canSubmit}
          validation={isEmpty ? undefined : buttonState.validation}
        />
      )}
    </div>
  );
}
