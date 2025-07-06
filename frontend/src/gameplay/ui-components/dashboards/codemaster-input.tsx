import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { ActionButton } from "../../shared/components";
import { useGameDataRequired } from "../../shared/providers";
import { Card } from "@frontend/shared-types";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  width: 100%;
  position: relative;

  /* Vertical in sidebar */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  width: auto;
  text-align: left;
  font-size: clamp(0.9rem, 2.5vw, 2.5rem);
  background-color: transparent;
  border-radius: 8px;
  padding: 1rem;
  flex: 1;

  /* Stack in sidebar */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    text-align: center;
    width: 100%;
    font-size: clamp(1rem, 1.5vw, 1.8rem);
  }

  @media (max-width: 768px) {
    font-size: clamp(0.8rem, 2vw, 1.2rem);
    padding: 0.5rem;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const InlineGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const InlineText = styled.span`
  font-size: inherit;
  color: ${({ theme }) => theme.text};
`;

const UnderlinedTextInput = styled.input<{ isError: boolean }>`
  padding: 0.2rem;
  font-size: inherit;
  border: none;
  border-bottom: 2px solid ${({ isError, theme }) => (isError ? theme.error : theme.text)};
  background: transparent;
  outline: none;
  text-align: center;
  width: auto;
  min-width: 60px;
  color: ${({ theme }) => theme.text};

  &:focus {
    border-bottom: 2px solid ${({ isError, theme }) => (isError ? theme.error : theme.primary)};
  }
`;

const UnderlinedNumberInput = styled(UnderlinedTextInput)`
  min-width: 30px;
`;

const ErrorMessage = styled.div`
  color: white;
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.error};
  border-radius: 8px;
  position: absolute;
  bottom: -2rem;
  left: 0;
  right: 0;

  @media (max-width: 480px) {
    position: static;
    margin-top: 0.5rem;
  }
`;


const StyledActionButton = styled(ActionButton)`
  font-size: clamp(1rem, 2vw, 1.5rem);
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.buttonText};
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
  const [inputNumberOfCards, setInputNumberOfCards] = useState(numberOfCards);
  const [errorMessage, setErrorMessage] = useState("");
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditable && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditable]);

  useEffect(() => {
    setInputCodeWord(codeWord);
    setInputNumberOfCards(numberOfCards);
  }, [codeWord, numberOfCards]);

  const handleSubmit = () => {
    if (!onSubmit) return;

    // Validation
    if (!inputCodeWord.trim()) {
      setErrorMessage("Please enter a clue word");
      return;
    }

    if (!inputNumberOfCards || inputNumberOfCards < 1 || inputNumberOfCards > 9) {
      setErrorMessage("Number of cards must be between 1 and 9");
      return;
    }

    // Check if word exists on board
    const cards: Card[] = gameData.currentRound?.cards || [];
    const wordExists = cards.some(
      (card) => card.word.toLowerCase() === inputCodeWord.toLowerCase(),
    );

    if (wordExists) {
      setErrorMessage("Clue word cannot be a word on the board");
      return;
    }

    setErrorMessage("");
    onSubmit(inputCodeWord, inputNumberOfCards);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isEditable && !isLoading) {
      handleSubmit();
    }
  };

  const hasError = errorMessage.length > 0;

  return (
    <Container>
      <InputContainer>
        <InlineGroup>
          <UnderlinedTextInput
            ref={textInputRef}
            type="text"
            value={inputCodeWord ?? undefined}
            onChange={(e) => setInputCodeWord(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isEditable || isLoading}
            isError={hasError}
            placeholder="word"
          />
        </InlineGroup>
        <InlineGroup>
          <InlineText>for</InlineText>
          <UnderlinedNumberInput
            type="number"
            min="1"
            max="9"
            value={inputNumberOfCards ?? ""}
            onChange={(e) => setInputNumberOfCards(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            disabled={!isEditable || isLoading}
            isError={hasError}
          />
          <InlineText>cards</InlineText>
        </InlineGroup>
      </InputContainer>

      {isEditable && (
        <StyledActionButton
          onClick={handleSubmit}
          text={isLoading ? "Submitting..." : "Submit Clue"}
          enabled={!isLoading}
        />
      )}

      {hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </Container>
  );
}
