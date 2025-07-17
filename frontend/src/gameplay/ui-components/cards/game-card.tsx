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
  
  // Debug logging for rendered attributes (only for first card)
  if (index === 0) {
    console.log(`[GameCard:${card.word}] Rendering with:`, {
      state,
      animation,
      teamType,
      clickable,
      selected: card.selected,
      cardIndex: index
    });
    
    // Log data attributes being applied
    const dataAttributes = {
      'data-team': teamType,
      'data-state': state,
      'data-animation': animation,
      'data-clickable': clickable && !card.selected
    };
    
    console.log(`[GameCard:${card.word}] Applied data attributes:`, dataAttributes);
  }
  
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
