import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import Flip from 'react-card-flip';
import { useGameContext } from '@game/context';

interface CardProps {
  selectedColor?: string;
  onClick: () => void;
  children: React.ReactNode;
}

const CardContainer = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0; // Ensure there's no padding affecting the size
`;

const Card = styled.button<CardProps>`
  height: 100%;
  width: 100%;
  border-radius: 5px;
  background-color: ${props => props.selectedColor || 'var(--color-card)'};
  color: white;selectedColor
  font-family: sans-serif;
  font-size: clamp(0.3rem, 2.5vw, 2rem); 
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0; 
`;

const CardContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-align: center;
  word-wrap: break-word; // Ensure text wraps properly
  overflow-wrap: break-word; // Additional wrapping for long words
  margin: 0; // Remove any margin
  padding: 0; // Remove any padding
`;

const FlipContainer = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box; // Ensure padding does not affect the total size
`;

interface GameCardProps {
  cardText: string;
  cardColor?: string;
  cardSelected: boolean;
  flippable? : boolean;
}

const GameCard: React.FC<GameCardProps> = (props) => {
  const { cardText, cardColor, cardSelected, flippable } = props;
  const [flipped, setFlipped] = useState<boolean>(cardSelected);

  const handleClick = () => {
    if(flippable) {
      setFlipped(true)
    }
  }
  return (
    <CardContainer>
      <FlipContainer>
        <Flip isFlipped={flipped} flipDirection="vertical" containerStyle={{ height: '100%', width: '100%' }}>
          <Card key="front" onClick={() =>handleClick()}>
            <CardContent>{cardText}</CardContent>
          </Card>
          <Card key="back" onClick={() => handleClick()} selectedColor={cardColor}>
            <CardContent>{cardText}</CardContent>
          </Card>
        </Flip>
      </FlipContainer>
    </CardContainer>
  );
};

export default GameCard;
