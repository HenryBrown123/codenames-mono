import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ActionButton from './action-button';
import { useGameContext } from '@game/context';

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
`;

const InlineGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const InlineText = styled.span`
  font-size: inherit;
`;

const UnderlinedTextInput = styled.input<{ isError: boolean }>`
  padding: 0.2rem;
  font-size: inherit;
  border: none;
  border-bottom: 2px solid ${props => (props.isError ? 'red' : '#000')};
  background: transparent;
  outline: none;
  text-align: center;
  width: auto;
  min-width: 60px;

  &:focus {
    border-bottom: 2px solid ${props => (props.isError ? 'red' : '#44a85a')};
  }
`;

const UnderlinedNumberInput = styled(UnderlinedTextInput)`
  min-width: 30px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
  order: 1;
`;

const ButtonWrapper = styled.div`
  order: 2;
  display: flex;
  justify-content: center;
  margin-top: 1rem;

  @media (min-width: 600px) {
    order: 0;
    margin-top: 0;

  }
`;
const StyledActionButton = styled(ActionButton)`
  font-size: clamp(1rem, 2vw, 1.5rem);
`;

type CodeWordInputProps = {
  codeWord?: string;
  numberOfCards?: number;
  isEditable?: boolean;
};

const CodeWordInput: React.FC<CodeWordInputProps> = ({ codeWord = "", numberOfCards = 0, isEditable = true }) => {
  const { gameData } = useGameContext();
  const [displayedWord, setDisplayedWord] = useState(codeWord);
  const [displayedNumber, setDisplayedNumber] = useState(numberOfCards);
  const [error, setError] = useState<string | null>(null);

  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.style.width = `${Math.max(displayedWord.length, 10) + 2}ch`;
    }
  }, [displayedWord]);

  useEffect(() => {
    const wordsInGameData = gameData.state.cards.map(card => card.word.toLowerCase()) || [];
    const isSingleWord = !/\s/.test(displayedWord);
    const isUnique = !wordsInGameData.some(word => displayedWord.toLowerCase().includes(word));

    if (!isSingleWord) {
      setError("The codeword must be a single word.");
    } else if (!isUnique) {
      setError("The codeword cannot contain any part of an existing word in the game.");
    } else {
      setError(null);
    }
  }, [displayedWord, gameData.state.cards]);

  const handleSubmit = () => {
    if (!error) {
      console.log("Codeword:", displayedWord);
      console.log("Number of Cards:", displayedNumber);
    }
  };

  return (
    <Container id="cm-input-outer-container">
      <InputContainer id="cm-input-inner-container">
        <InlineGroup className="cm-input-inline-group">
          <UnderlinedTextInput
            ref={textInputRef}
            type="text"
            value={displayedWord}
            onChange={(e) => setDisplayedWord(e.target.value)}
            placeholder="codeword"
            disabled={!isEditable}
            isError={!!error}
          />
          <InlineText>links</InlineText>
        </InlineGroup>

        <InlineGroup className="cm-input-inline-group">
          <UnderlinedNumberInput
            type="number"
            value={displayedNumber}
            onChange={(e) => setDisplayedNumber(parseInt(e.target.value))}
            min={1}
            max={9}
            placeholder="0"
            disabled={!isEditable}
            isError={!!error}
          />
          <InlineText>cards</InlineText>
        </InlineGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isEditable && (
          <ButtonWrapper>
            <StyledActionButton
              text="Submit"
              onClick={handleSubmit}
              enabled={!error && displayedWord.length > 0 && displayedNumber > 0}
            />
          </ButtonWrapper>
        )}
      </InputContainer>
    </Container>
  );
};

export default CodeWordInput;
