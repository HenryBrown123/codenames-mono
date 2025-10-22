import React, { memo, useCallback } from "react";
import { Card } from "@frontend/shared-types";
// import { useCardVisibility } from "./use-card-visibility";
import { useSandboxCardVisibility } from "../../../sandbox/card-visibility-sandbox.hooks";
import { getTeamType, getCardColor } from "./card-utils";
import { cx } from "../../../lib/classnames";
import styles from "./game-card.module.css";
import {
  cardContainerAnimations,
  coverLayerAnimations,
  spymasterOverlayAnimations,
} from "./card-animation-definitions";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
  isCurrentTeam: boolean; // Pass this from parent to avoid re-renders
}

/**
 * Determines text size class based on word length
 * Using semantic naming that describes content
 */
const getTextSizeClass = (word: string, threshold: number = 9): string => {
  const length = word.length;

  if (length <= threshold) return styles.textNormal;
  return styles.textLong;
};

/**
 * Game card component with visibility state management
 */
export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, isCurrentTeam }) => {
    // Use sandbox hook - pass card.word as entityId
    const { displayState, createAnimationRef } = useSandboxCardVisibility(card.word, index);

    // Create animation refs for each element
    const containerRef = createAnimationRef("container", cardContainerAnimations);
    const coverRef = createAnimationRef("cover", coverLayerAnimations);
    const overlayRef = createAnimationRef("spymaster-overlay", spymasterOverlayAnimations);

    const teamType = getTeamType(card);
    const cardColor = getCardColor(card);

    // Get dynamic threshold from CSS variable
    const [threshold, setThreshold] = React.useState(9);

    React.useEffect(() => {
      const updateThreshold = () => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(
          "--font-threshold",
        );
        const numValue = parseInt(value) || 9;
        setThreshold(numValue);
      };

      updateThreshold();
      // Set up observer for changes
      const observer = new MutationObserver(updateThreshold);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

      return () => observer.disconnect();
    }, []);

    const handleClick = useCallback(() => {
      if (clickable && !card.selected) {
        onClick();
      }
    }, [clickable, card.selected, onClick]);

    const isColored = displayState === "visible-colored";
    const showSpymasterOverlay = isColored;

    return (
      <div
        ref={containerRef}
        className={styles.cardContainer}
        data-team={teamType}
        data-state={displayState}
        data-clickable={clickable && !card.selected}
        data-current-team={isCurrentTeam ? "true" : "false"}
        style={
          {
            "--card-index": index,
            "--team-color": cardColor,
          } as React.CSSProperties
        }
      >
        {/* Normal beige card */}
        <div
          onClick={handleClick}
          className={cx(styles.normalCard, isCurrentTeam && styles.currentTeam)}
        >
          <div className={styles.ripple} />
          <span className={cx(styles.cardWord, getTextSizeClass(card.word, threshold))}>
            {card.word}
          </span>
        </div>

        {/* Cover card - shows when selected */}
        <div ref={coverRef} className={styles.coverCard}>
          <TeamSymbol teamType={teamType} />
        </div>

        {/* Spymaster overlay - shows in AR mode */}
        {showSpymasterOverlay && (
          <div ref={overlayRef} className={styles.spymasterOverlay}>
            <TeamColorFilter />
            <ScanGrid />
            <SpymasterSymbol />
            <span className={cx(styles.cardWord, getTextSizeClass(card.word, threshold))}>
              {card.word}
            </span>
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
  },
);

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
