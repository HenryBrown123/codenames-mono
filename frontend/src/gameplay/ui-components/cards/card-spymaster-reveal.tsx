import React from "react";
import { Card } from "@frontend/shared-types";
import { getTeamType, getCardColor, isYourTeam, getSymbol } from "./card-utils";
import {
  ARScanGrid,
  ARWordOverlay,
  ARInfoTag,
  ARClassification,
  ARTargetBracket,
  WordBracket,
  TeamSymbolOverlay
} from "./ar-overlay-components";

export interface SpymasterRevealProps {
  card: Card;
  isVisible: boolean;
}

export const SpymasterReveal: React.FC<SpymasterRevealProps> = ({ card, isVisible }) => {
  if (!isVisible) return null;

  const teamType = getTeamType(card);
  const teamColor = getCardColor(card);
  const isOwnTeam = isYourTeam(card);
  const symbol = getSymbol(teamColor);

  return (
    <>
      {/* Team Symbol Overlay - shows in AR mode and when covered */}
      {symbol && (
        <TeamSymbolOverlay 
          $teamColor={teamColor}
          $symbol={symbol}
          $isAssassin={teamColor === "#0a0a0a"}
        />
      )}

      {/* AR Elements - Hidden by default, shown in AR mode via CSS */}
      <ARScanGrid />
      
      <ARWordOverlay $teamColor={teamColor} $isYourTeam={isOwnTeam}>
        {card.word}
        
        {/* Targeting brackets for your team */}
        {isOwnTeam && (
          <>
            <WordBracket className="tl" $bracketColor={teamColor} />
            <WordBracket className="tr" $bracketColor={teamColor} />
            <WordBracket className="bl" $bracketColor={teamColor} />
            <WordBracket className="br" $bracketColor={teamColor} />
          </>
        )}
      </ARWordOverlay>
      
      <ARInfoTag $teamType={teamType} />
      <ARClassification $teamType={teamType} />
      <ARTargetBracket />
    </>
  );
};