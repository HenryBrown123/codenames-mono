import { useState } from 'react';
import styled from 'styled-components';
import ActionButton from './action-button';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 20px;
  width: 100%; /* Ensures container takes full width */
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const Label = styled.label`
  font-size: clamp(1.5rem, 3vw, 2.5rem); /* Responsive font size using clamp */
`;

const UnderlinedTextInput = styled.input`
  padding: 0.5rem 0.25rem;
  font-size: clamp(1rem, 2.5vw, 2.5rem); /* Dynamic font size with clamp */
  width: 100%; /* Ensures input takes up full width */
  max-width: 400px; /* Optional: Prevent it from becoming too wide on larger screens */
  height: 100%;
  border: none; /* No border */
  border-bottom: 2px solid #000; /* Underline effect */
  background: transparent;
  box-sizing: border-box; /* Ensure padding is included in the width */
  outline: none; /* Remove the default input outline */

  &:focus {
    border-bottom: 2px solid #44a85a; /* Change the underline color when focused */
  }
`;

const UnderlinedNumberInput = styled.input`
  padding: 0.5rem 0.25rem;
  font-size: clamp(1rem, 2.5vw, 2.5rem); /* Dynamic font size with clamp */
  max-width: 200px; /* Optional: Make the number input not too wide */
  height: 100%;
  border: none; /* No border */
  border-bottom: 2px solid #000; /* Underline effect */
  background: transparent;
  box-sizing: border-box; /* Ensure padding is included in the width */
  outline: none; /* Remove the default input outline */

  &:focus {
    border-bottom: 2px solid #44a85a; /* Change the underline color when focused */
  }
`;

const StageInputForm = () => {
  const [codeword, setCodeword] = useState("");
  const [numCards, setNumCards] = useState(0);

  const handleSubmit = () => {
    console.log("Codeword:", codeword);
    console.log("Number of Cards:", numCards);
  };

  return (
    <InputContainer>
      <UnderlinedTextInput
        type="text"
        value={codeword}
        onChange={(e) => setCodeword(e.target.value)}
        placeholder="codeword"
      />
      
      <Label>{"links"}</Label>
      <UnderlinedNumberInput
        type="number"
        value={numCards}
        onChange={(e) => setNumCards(parseInt(e.target.value))}
        min={1}
        max={9}
      />
      <Label>{"cards"}</Label>
      
      <ActionButton text="Submit" onClick={handleSubmit} enabled={codeword.length > 0 && numCards > 0} />
    </InputContainer>
  );
};

export default StageInputForm;
