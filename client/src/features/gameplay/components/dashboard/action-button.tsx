import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button<{ enabled: boolean }>`
  font-size: 3vh;
  text-align: center;
  display: inline-block;
  margin: 5px;
  font-weight: bold;
  padding: 1rem 2rem;
  background-color: lightgray;
  text-shadow: -1px -1px black, 1px 1px white;
  color: gray;
  border-radius: 15px;
  box-shadow: 0 .2em gray; 
  cursor: ${({ enabled }) => (enabled ? 'pointer' : 'not-allowed')};
  opacity: ${({ enabled }) => (enabled ? 1 : 0.5)};

  /* Apply styles only if enabled */
  &:active {
    ${({ enabled }) =>
      enabled &&
      `
      box-shadow: none;
      position: relative;
      top: .2em;
    `}
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; 
`;


type ButtonProp = {
  text?: string;
  enabled?: boolean;
  onClick: () => void;
};

const ActionButton: React.FC<ButtonProp> = ({ text = "PLAY", enabled = true }) => {
  return (
    <ButtonWrapper>
      <StyledButton enabled={enabled} disabled={!enabled}>
        {text}
      </StyledButton>
    </ButtonWrapper>
  );
};

export default ActionButton;
