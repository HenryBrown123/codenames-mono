import React, { useState } from 'react';
import styled from 'styled-components';
import Flip from 'react-card-flip';

interface CardProps {
  selectedColor?: string;
  onClick: () => void;
  children: React.ReactNode;
}

const CardContainer = styled.div`
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
`;

const Card = styled.button<CardProps>`
  height: 100%;
  width: 100%;
  border-radius: 5px;
  background-color: ${props => props.selectedColor || 'var(--color-card)'};
  color: white;
  font-family: sans-serif;
  font-size: clamp(0.5rem, 2vw, 2rem);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-align: center;
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
        <Flip isFlipped={flipped} flipDirection="vertical" containerStyle={{ height: '100%', width: '100%' }}>
          <Card key="front" onClick={() => setFlipped(true)}>
            <CardContent>{cardText}</CardContent>
          </Card>
          <Card key="back" onClick={() => setFlipped(true)} selectedColor={cardColor}>
            <CardContent>{cardText}</CardContent>
          </Card>
        </Flip>
    </CardContainer>
  );
};

export default GameCard;
