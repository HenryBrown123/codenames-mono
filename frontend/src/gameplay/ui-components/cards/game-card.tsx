import React, { memo, useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import { getTeamType, getCardColor } from "./card-utils";
import { useGameDataRequired } from "../../shared/providers";
import { cx } from "../../../lib/classnames";
import styles from './game-card.module.css';

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
  const { state, animation, handleAnimationStart, handleAnimationEnd } = useCardVisibility(card);
  const { gameData } = useGameDataRequired();
  const teamType = getTeamType(card);
  const cardColor = getCardColor(card);

  const isCurrentTeam = gameData.playerContext?.teamName === card.teamName;

  const handleClick = useCallback(() => {
    if (clickable && !card.selected) {
      onClick();
    }
  }, [clickable, card.selected, onClick]);

  const isColored = state === "visible-colored";
  const isCovered = state === "visible-covered";
  const showSpymasterOverlay = isColored;

  return (
    <div
      className={styles.cardContainer}
      data-team={teamType}
      data-state={state}
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
        <div 
          onClick={handleClick} 
          className={cx(
            styles.normalCard,
            isCurrentTeam && styles.currentTeam
          )}
        >
          <div className={styles.ripple} />
          <span className={styles.cardWord}>{card.word}</span>
        </div>
      )}

      {/* Cover card - shows when selected */}
      <div className={styles.coverCard}>
        <TeamSymbol teamType={teamType} />
      </div>

      {/* Spymaster overlay - shows in AR mode */}
      {showSpymasterOverlay && (
        <div className={styles.spymasterOverlay}>
          <TeamColorFilter />
          <ScanGrid />
          <SpymasterSymbol />
          <span className={styles.cardWord}>{card.word}</span>
          <div className={styles.teamBadge}>{teamType.toUpperCase()}</div>
          {isCurrentTeam && (
            <div className={styles.cardARCorners}>
              <CardARCorner position="tl" />
              <CardARCorner position="tr" />
              <CardARCorner position="bl" />
              <CardARCorner position="br" />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

GameCard.displayName = "GameCard";

// Simple sub-components
const TeamSymbol = ({ teamType }: { teamType: string }) => (
  <div className={styles.teamSymbol} data-team={teamType} />
);

const TeamColorFilter = () => <div className={styles.teamColorFilter} />;
const ScanGrid = () => <div className={styles.scanGrid} />;
const SpymasterSymbol = () => <div className={styles.spymasterSymbol} />;

const CardARCorner = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => (
  <div className={styles.cardARCorner} data-position={position} />
);
