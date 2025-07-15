import React from "react";
import { Card } from "@frontend/shared-types";
import { CoverCard as StyledCoverCard, CenterIcon } from "./card-styles";
import { getCardColor, getCardIcon } from "./card-utils";
import type { VisualState, AnimationType } from "./card-visibility-provider";

export interface CoverCardProps {
  card: Card;
  state: VisualState;
  animation: AnimationType;
  className?: string;
}

export const CoverCard: React.FC<CoverCardProps> = ({ 
  card, 
  state, 
  animation,
  className = "cover-card"
}) => {
  const teamColor = getCardColor(card);
  const icon = getCardIcon(teamColor);

  return (
    <StyledCoverCard
      className={className}
      $teamColor={teamColor}
      $transformPx={{ translateX: 0, translateY: 0, rotate: 0 }}
      data-team-color={teamColor}
      data-state={state}
      data-animation={animation}
    >
      {icon && (
        <CenterIcon className={teamColor === "#0a0a0a" ? "assassin" : ""}>
          {icon}
        </CenterIcon>
      )}
    </StyledCoverCard>
  );
};