import React, { memo, useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import { CardContainer } from "./card-styles";
import { BaseCard } from "./card-base";
import { CoverCard } from "./card-cover";
import { SpymasterReveal } from "./card-spymaster-reveal";
import type { VisualState } from "./card-visibility-provider";

/**
 * GameCard component props
 */
export interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
  initialVisibility: VisualState;
}

/**
 * Individual game card component with mobile-first responsive design
 */
export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, initialVisibility }) => {
    const visibility = useCardVisibility(card, index, initialVisibility);
    const showSpymasterInfo = visibility.state === "visible-colored";

    const handleAnimationEnd = useCallback(
      (e: React.AnimationEvent) => {
        if (e.target === e.currentTarget && visibility.animation) {
          visibility.handleAnimationEnd();
        }
      },
      [visibility.animation, visibility.handleAnimationEnd],
    );

    const handleClick = useCallback(() => {
      if (clickable && !card.selected) {
        onClick();
      }
    }, [clickable, card.selected, onClick]);

    return (
      <CardContainer
        data-state={visibility.state}
        data-animation={visibility.animation}
        style={{ "--card-index": index } as React.CSSProperties}
        onAnimationEnd={handleAnimationEnd}
      >
        <BaseCard
          card={card}
          clickable={clickable && !card.selected}
          onClick={handleClick}
          disabled={!clickable || card.selected}
        />
        
        <SpymasterReveal 
          card={card} 
          isVisible={showSpymasterInfo} 
        />
        
        <CoverCard 
          card={card} 
          state={visibility.state} 
          animation={visibility.animation} 
        />
      </CardContainer>
    );
  },
);

GameCard.displayName = "GameCard";