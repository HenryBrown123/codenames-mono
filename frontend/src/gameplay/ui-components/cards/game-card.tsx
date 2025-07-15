import React, { memo, useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import { CardContainer, BaseCard, CardOverlay, CardWord } from "./card-styles";
import { getTeamType } from "./card-utils";
import type { VisualState } from "./card-visibility-provider";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
  initialVisibility: VisualState;
}

/**
 * Game card component with clean state/animation separation
 * States: hidden, visible, visible-colored, visible-covered
 */
export const GameCard = memo<GameCardProps>(({ 
  card, 
  index, 
  onClick, 
  clickable,
  initialVisibility
}) => {
  const visibility = useCardVisibility(card, index, initialVisibility);
  const teamType = getTeamType(card);
  
  const handleAnimationEnd = useCallback(() => {
    // Let visibility provider know animation completed
    if (visibility.animation) {
      visibility.handleAnimationEnd();
    }
  }, [visibility]);
  
  const handleClick = useCallback(() => {
    if (clickable && !card.selected) {
      onClick();
    }
  }, [clickable, card.selected, onClick]);
  
  return (
    <CardContainer 
      data-team={teamType}
      data-state={visibility.state}
      data-animation={visibility.animation}
      data-clickable={clickable && !card.selected}
      style={{ '--card-index': index } as React.CSSProperties}
      onAnimationEnd={handleAnimationEnd}
    >
      <BaseCard onClick={handleClick}>
        <CardWord>{card.word}</CardWord>
      </BaseCard>
      
      <CardOverlay />
    </CardContainer>
  );
});

GameCard.displayName = "GameCard";