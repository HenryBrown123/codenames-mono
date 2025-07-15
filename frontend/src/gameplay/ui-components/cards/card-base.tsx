import React from "react";
import { Card } from "@frontend/shared-types";
import { BaseCard as StyledBaseCard, CardContent } from "./card-styles";
import { getCardColor } from "./card-utils";

export interface BaseCardProps {
  card: Card;
  clickable: boolean;
  onClick: () => void;
  disabled: boolean;
  className?: string;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  card,
  clickable,
  onClick,
  disabled,
  className = "base-card"
}) => {
  const teamColor = getCardColor(card);

  return (
    <StyledBaseCard
      className={className}
      $teamColor={teamColor}
      $clickable={clickable}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Card: ${card.word}`}
    >
      <CardContent>{card.word}</CardContent>
    </StyledBaseCard>
  );
};