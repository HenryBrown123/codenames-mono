import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { ActionButton } from "../../shared/components";
import { useGameDataRequired } from "../../shared/providers";
import { Card } from "@frontend/shared-types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const InputContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  text-align: center;
  font-size: clamp(0.9rem, 2.5vw, 2.5rem);
  background-color: ${({ theme }) => theme.inputBackground || "rgba(0,0,0,0.1)"};
  border-radius: 8px;
  padding: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
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
  font-size: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
  order: 1;
  background-color: ${({ theme }) => theme.error};
`;

const ButtonWrapper = styled.div`
  order: 3;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  width: 100%;
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

      {hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {isEditable && (
        <ButtonWrapper>
          <StyledActionButton
            onClick={handleSubmit}
            text={isLoading ? "Submitting..." : "Submit Clue"}
            enabled={!isLoading}
          />
        </ButtonWrapper>
      )}
    </Container>
  );
}
