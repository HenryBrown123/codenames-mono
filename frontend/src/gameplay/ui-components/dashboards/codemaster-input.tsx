import React, { useState, useEffect, useRef } from "react";
import { ActionButton } from "../../shared/components";
import { useGameDataRequired } from "../../shared/providers";
import { Card } from "@frontend/shared-types";
import styles from "./codemaster-input.module.css";


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

  const handleSubmit = () => {
    if (!onSubmit) return;
    if (!inputCodeWord.trim()) {
      setErrorMessage("Please enter a clue word");
      return;
    }
    if (inputNumberOfCards < 1 || inputNumberOfCards > 9) {
      setErrorMessage("Number of cards must be between 1 and 9");
      return;
    }
    const cards: Card[] = gameData.currentRound?.cards || [];
    if (cards.some((c) => c.word.toLowerCase() === inputCodeWord.toLowerCase())) {
      setErrorMessage("Clue word cannot be a word on the board");
      return;
    }
    setErrorMessage("");
    onSubmit(inputCodeWord, inputNumberOfCards);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isEditable && !isLoading) handleSubmit();
  };
  const decrement = () => setInputNumberOfCards((n) => Math.max(1, n - 1));
  const increment = () => setInputNumberOfCards((n) => Math.min(9, n + 1));
  const hasError = errorMessage.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <div className={styles.inlineGroup}>
          <input
            ref={textInputRef}
            type="text"
            value={inputCodeWord}
            onChange={(e) => setInputCodeWord(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isEditable || isLoading}
            data-error={hasError}
            placeholder="COOEWORD"
            autoComplete="off"
            className={styles.codeWordInputField}
          />
        </div>
        <div className={styles.inlineGroup}>
          <span className={styles.inlineText}>for</span>
          <div className={styles.numberInput}>
            <button
              className={styles.numberButton}
              onClick={decrement}
              disabled={!isEditable || isLoading || inputNumberOfCards <= 1}
            >
              -
            </button>
            <div className={styles.numberDisplay}>{inputNumberOfCards}</div>
            <button
              className={styles.numberButton}
              onClick={increment}
              disabled={!isEditable || isLoading || inputNumberOfCards >= 9}
            >
              +
            </button>
          </div>
          <span className={styles.inlineText}>cards</span>
        </div>
      </div>

      {isEditable && (
        <ActionButton
          onClick={handleSubmit}
          text={isLoading ? "TRANSMITTING..." : "SUBMIT CLUE"}
          enabled={!isLoading}
        />
      )}

      {hasError && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
}
