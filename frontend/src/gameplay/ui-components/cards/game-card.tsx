import React, { memo, useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import { CardContainer, BaseCard, CardOverlay, CardWord } from "./card-styles";
import { getTeamType } from "./card-utils";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
}

/**
 * Game card with animation lifecycle management
 */
export const GameCard = memo<GameCardProps>(({ 
  card, 
  index, 
  onClick, 
  clickable 
}) => {
  const { state, animation, handleAnimationStart, handleAnimationEnd } = useCardVisibility(card, index);
  const teamType = getTeamType(card);
  
  const handleClick = useCallback(() => {
    if (clickable && !card.selected) {
      onClick();
    }
  }, [clickable, card.selected, onClick]);
  
  return (
    <CardContainer 
      data-team={teamType}
      data-state={state}
      data-animation={animation}
      data-clickable={clickable && !card.selected}
      style={{ '--card-index': index } as React.CSSProperties}
    >
      <BaseCard 
        onClick={handleClick}
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
      >
        <CardWord>{card.word}</CardWord>
      </BaseCard>
      
      <CardOverlay 
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
      />
    </CardContainer>
  );
});

GameCard.displayName = "GameCard";
