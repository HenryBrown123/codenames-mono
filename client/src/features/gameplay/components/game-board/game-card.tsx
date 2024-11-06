import React, { useState } from 'react';
import styled from 'styled-components';
import Flip from 'react-card-flip';

interface CardProps {
  selectedColor?: string;
  onClick: () => void;
  children: React.ReactNode;
}

const CardContainer = styled.div`
  margin: 0;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-grow: 1; // Ensure it grows to fill the available space
`;

const Card = styled.button<CardProps>`
  margin: 0;
  height: 100%;
  width: 100%;
  border-radius: 5px;
  background-color: ${props => props.selectedColor || 'var(--color-card)'};
  color: white;
  font-family: sans-serif;
  font-size: clamp(0.5rem, 2vw, 2rem); // Responsive font size using clamp
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1; // Ensure it grows to fill the container
  flex-shrink: 0; // Prevent it from shrinking

  p {
    margin: 0;
    padding: 0;
    width: 100%;
    text-align: center;
  }
`;

interface GameCardProps {
  cardText: string;
  cardColor?: string;
  cardSelected: boolean;
}

const GameCard = ({ cardText, cardColor, cardSelected }: GameCardProps) => {
  const [flipped, setFlipped] = useState<boolean>(cardSelected);

  return (
    <CardContainer>
      <Flip isFlipped={flipped} flipDirection="vertical">
        <Card 
          id="card" 
          key="front" 
          onClick={() => setFlipped(true)}
        >
          <p>{cardText}</p>
        </Card>
        <Card 
          id="card" 
          key="back" 
          onClick={() => setFlipped(true)}
          selectedColor={cardColor}
        >
          <p>{cardText}</p>
        </Card>
      </Flip>
    </CardContainer>
  );
};

export default GameCard;
