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
  CardARCorners,
  CardARCorner,
  SpymasterSymbol,
  CardWord,
  TeamSymbol,
} from "./card-styles";
import { getTeamType, getCardColor } from "./card-utils";
import { useGameDataRequired } from "../../shared/providers";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
}

/**
 * Game card component with visibility state management
 */
export const GameCard = memo<GameCardProps>(({ card, index, onClick, clickable }) => {
  const { state, animation, handleAnimationStart, handleAnimationEnd } = useCardVisibility(
    card,
    index,
  );
  const { gameData } = useGameDataRequired();
  const teamType = getTeamType(card);
  const cardColor = getCardColor(card);

  const isCurrentTeam = gameData.playerContext?.teamName === card.teamName;

  const handleClick = useCallback(() => {
    if (clickable && !card.selected) {
      onClick();
    }
  }, [clickable, card.selected, onClick]);

  const isNormal = state === "visible";
  const isColored = state === "visible-colored";
  const isCovered = state === "visible-covered";
  const showSpymasterOverlay = isColored;

  return (
    <CardContainer
      data-team={teamType}
      data-animation={animation}
      data-clickable={clickable && !card.selected}
      data-current-team={isCurrentTeam ? "true" : "false"}
      style={
        {
          "--card-index": index,
          "--team-color": cardColor,
        } as React.CSSProperties
      }
      onAnimationStart={handleAnimationStart}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Normal beige card */}
      {!isCovered && (
        <NormalCard onClick={handleClick} className="normal-card" $isCurrentTeam={isCurrentTeam}>
          <div className="ripple" />
          <CardWord className="card-word">{card.word}</CardWord>
        </NormalCard>
      )}

      {/* Cover card - no text, just symbol */}
      {isCovered && (
        <CoverCard className="cover-card">
          <TeamSymbol />
        </CoverCard>
      )}

      {/* Spymaster overlay - vibrant colors with glow */}
      {showSpymasterOverlay && (
        <SpymasterOverlay className="spymaster-overlay">
          <TeamColorFilter />
          <ScanGrid />
          <SpymasterSymbol />
          <CardWord>{card.word}</CardWord>
          <TeamBadge>{teamType.toUpperCase()}</TeamBadge>
          {isCurrentTeam && (
            <CardARCorners>
              <CardARCorner $position="tl" />
              <CardARCorner $position="tr" />
              <CardARCorner $position="bl" />
              <CardARCorner $position="br" />
            </CardARCorners>
          )}
        </SpymasterOverlay>
      )}
    </CardContainer>
  );
});

GameCard.displayName = "GameCard";
