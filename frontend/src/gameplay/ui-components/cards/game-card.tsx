import React, { memo, useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import { 
  CardContainer, 
  NormalCard, 
  CoverCard, 
  SpymasterOverlay,
  TeamColorFilter,
  ScanGrid,
  TeamBadge,
  CardWord,
  TeamSymbol
} from "./card-styles";
import { getTeamType, getCardColor } from "./card-utils";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
}

export const GameCard = memo<GameCardProps>(({ 
  card, 
  index, 
  onClick, 
  clickable 
}) => {
  const { state, animation, handleAnimationStart, handleAnimationEnd } = useCardVisibility(card, index);
  const teamType = getTeamType(card);
  const cardColor = getCardColor(card);
  
  const handleClick = useCallback(() => {
    if (clickable && !card.selected) {
      onClick();
    }
  }, [clickable, card.selected, onClick]);

  // Determine what to render based on state
  const isNormal = state === "visible";
  const isColored = state === "visible-colored"; 
  const isCovered = state === "visible-covered";
  const showSpymasterOverlay = isColored;

  // Debug logging for rendered attributes (only for first card)
  if (index === 0) {
    console.log(`[GameCard:${card.word}] Rendering with:`, {
      state,
      animation,
      teamType,
      clickable,
      selected: card.selected,
      cardIndex: index,
      isNormal,
      isColored,
      isCovered,
      showSpymasterOverlay
    });
  }

  return (
    <CardContainer 
      data-team={teamType}
      data-animation={animation}
      data-clickable={clickable && !card.selected}
      style={{ 
        '--card-index': index,
        '--team-color': cardColor
      } as React.CSSProperties}
      onAnimationStart={handleAnimationStart}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Normal beige card - visible unless covered */}
      {!isCovered && (
        <NormalCard onClick={handleClick}>
          <CardWord>{card.word}</CardWord>
        </NormalCard>
      )}
      
      {/* Cover card - only when selected/guessed */}
      {isCovered && (
        <CoverCard className="cover-card">
          <TeamSymbol />
          <CardWord style={{ color: 'white' }}>{card.word}</CardWord>
        </CoverCard>
      )}
      
      {/* Spymaster overlay - shows team affiliation */}
      {showSpymasterOverlay && (
        <SpymasterOverlay className="spymaster-overlay">
          <TeamColorFilter />
          <ScanGrid />
          <TeamBadge>{teamType.toUpperCase()}</TeamBadge>
        </SpymasterOverlay>
      )}
    </CardContainer>
  );
});

GameCard.displayName = "GameCard";