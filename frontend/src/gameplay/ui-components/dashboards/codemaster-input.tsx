import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { ActionButton } from "../../shared/components";
import { useGameDataRequired } from "../../shared/providers";
import { Card } from "@frontend/shared-types";

const scanlineAnimation = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* slightly reduced gap */
  width: 100%;
  padding: 1.5rem; /* reduced padding */
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--color-primary, #ffbf00);
  border-radius: 6px; /* slightly smaller radius */
  box-shadow:
    0 0 20px rgba(0, 255, 136, 0.3),
    inset 0 0 15px rgba(0, 255, 136, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1.5px; /* thinner scanline */
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 255, 136, 0.8) 50%,
      transparent 100%
    );
    animation: ${scanlineAnimation} 3s linear infinite;
  }
`;

const CodeWordInputField = styled.input<{ isError?: boolean }>`
  background: transparent;
  border: none;
  border-bottom: 2px solid
    ${({ isError }) => (isError ? "#ff4f4f" : "var(--color-primary, #ffc800)")};
  color: var(--color-primary, #00ff88);
  font-size: 2rem; /* reduced font size */
  font-weight: 900;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 0.3rem 0.5rem;
  width: 100%;
  max-width: 500px;
  font-family: "JetBrains Mono", monospace;
  text-shadow: 0 0 15px rgba(0, 255, 136, 0.5);

  &::placeholder {
    color: rgba(0, 255, 136, 0.3);
    text-transform: none;
    letter-spacing: 0.05em;
  }

  &:focus {
    outline: none;
    border-bottom-color: #fff;
    text-shadow:
      0 0 25px rgba(0, 255, 136, 0.8),
      0 0 50px rgba(0, 255, 136, 0.4);
  }
`;

const NumberInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem; /* reduced gap */
  font-size: 1.5rem; /* smaller font */
  font-weight: 700;
  color: var(--color-primary, #00ff88);
  font-family: "JetBrains Mono", monospace;
`;

const NumberButton = styled.button`
  width: 40px; /* reduced size */
  height: 40px;
  border: 2px solid var(--color-primary, #00ff88);
  background: transparent;
  color: var(--color-primary, #00ff88);
  font-size: 1.25rem;
  font-weight: 900;
  cursor: pointer;
  border-radius: 50%;
  transition: transform 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary, #00ff88);
    color: #000;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const NumberDisplay = styled.div`
  font-size: 2rem; /* smaller display */
  font-weight: 900;
  min-width: 40px;
  text-align: center;
  text-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
`;

const InlineGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
`;

const InlineText = styled.span`
  font-size: inherit;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
`;

const ErrorMessage = styled.div`
  color: white;
  font-size: clamp(0.75rem, 1.2vw, 0.9rem);
  text-align: center;
  padding: 0.4rem;
  background-color: ${({ theme }) => theme.error};
  border-radius: 6px;
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  right: 0;
  max-width: 100%;

  @media (max-width: 480px) {
    position: static;
    margin-top: 0.4rem;
  }
`;

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
    <Container>
      <InputContainer>
        <InlineGroup>
          <CodeWordInputField
            ref={textInputRef}
            type="text"
            value={inputCodeWord}
            onChange={(e) => setInputCodeWord(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isEditable || isLoading}
            isError={hasError}
            placeholder="COOEWORD"
            autoComplete="off"
          />
        </InlineGroup>
        <InlineGroup>
          <InlineText>for</InlineText>
          <NumberInput>
            <NumberButton
              onClick={decrement}
              disabled={!isEditable || isLoading || inputNumberOfCards <= 1}
            >
              -
            </NumberButton>
            <NumberDisplay>{inputNumberOfCards}</NumberDisplay>
            <NumberButton
              onClick={increment}
              disabled={!isEditable || isLoading || inputNumberOfCards >= 9}
            >
              +
            </NumberButton>
          </NumberInput>
          <InlineText>cards</InlineText>
        </InlineGroup>
      </InputContainer>

      {isEditable && (
        <ActionButton
          onClick={handleSubmit}
          text={isLoading ? "TRANSMITTING..." : "SUBMIT CLUE"}
          enabled={!isLoading}
        />
      )}

      {hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </Container>
  );
}
