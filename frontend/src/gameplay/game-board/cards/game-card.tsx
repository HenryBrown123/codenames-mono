import { memo, useMemo, useState, useEffect } from "react";
import { Card } from "@frontend/shared-types";
import { useAnimationRegistration } from "../../animations/use-animation-registration";
import { useCardAnimationEffects } from "./use-card-animation-effects";
import { useCardEvent } from "../../game-data/events";
import { useViewMode } from "../view-mode/view-mode-context";
import { useAnimationEngine } from "../../animations/animation-engine-context";
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
  isCurrentTeam: boolean;
}

const getTextSizeClass = (word: string, threshold: number = 9): string => {
  const length = word.length;
  if (length <= threshold) return styles.textNormal;
  return styles.textLong;
};

export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, isCurrentTeam }) => {
    const { viewMode } = useViewMode();
    const engine = useAnimationEngine();

    const entryAnimation = useMemo(() => {
      return viewMode === 'dealing' ? 'deal' : undefined;
    }, [viewMode]);

    // Base entity context without animation state
    const baseEntityContext = useMemo(
      () => ({
        teamName: card.teamName,
        selected: card.selected,
        viewMode,
        index,
      }),
      [card.teamName, card.selected, viewMode, index]
    );

    const { createAnimationRef } = useAnimationRegistration(
      card.word,
      baseEntityContext,
      {
        entryTransition: entryAnimation,
      }
    );

    // Get next event from server event log
    const nextEvent = useCardEvent(card.word);

    const { isAnimating, displayState } = useCardAnimationEffects({
      viewMode,
      nextEvent,
      triggerTransition: async (event: string) => {
        const transitionsMap = new Map();
        transitionsMap.set(card.word, { entityId: card.word, event });
        await engine.playTransitions(transitionsMap);
      },
    });

    // Update engine context with animation state separately
    useEffect(() => {
      engine.updateEntityContext(card.word, {
        ...baseEntityContext,
        displayState,
        isAnimating,
      });
    }, [engine, card.word, baseEntityContext, displayState, isAnimating]);

    const containerRef = createAnimationRef("container", cardContainerAnimations);
    const coverRef = createAnimationRef("cover", coverLayerAnimations);
    const overlayRef = createAnimationRef("spymaster-overlay", spymasterOverlayAnimations);

    const teamType = getTeamType(card);
    const cardColor = getCardColor(card);

    const [threshold, setThreshold] = useState(9);

    useEffect(() => {
      const updateThreshold = () => {
        const root = document.documentElement;
        const value = getComputedStyle(root).getPropertyValue('--text-length-threshold');
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
          setThreshold(parsed);
        }
      };

      updateThreshold();
      window.addEventListener('resize', updateThreshold);
      return () => window.removeEventListener('resize', updateThreshold);
    }, []);

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
        <div
          onClick={!isAnimating && clickable && !card.selected ? onClick : undefined}
          className={cx(styles.normalCard, isCurrentTeam && styles.currentTeam)}
        >
          <div className={styles.ripple} />
          <span className={cx(styles.cardWord, getTextSizeClass(card.word, threshold))}>
            {card.word}
          </span>
        </div>

        <div ref={coverRef} className={styles.coverCard}>
          <div className={styles.teamSymbol} data-team={teamType} />
        </div>

        {showSpymasterOverlay && (
          <div ref={overlayRef} className={styles.spymasterOverlay}>
            <div className={styles.teamColorFilter} />
            <div className={styles.scanGrid} />
            <div className={styles.spymasterSymbol} />
            <span className={cx(styles.cardWord, getTextSizeClass(card.word, threshold))}>
              {card.word}
            </span>
            <div className={styles.teamBadge}>{teamType.toUpperCase()}</div>
            {isCurrentTeam && (
              <div className={styles.cardARCorners}>
                <div className={styles.cardARCorner} data-position="tl" />
                <div className={styles.cardARCorner} data-position="tr" />
                <div className={styles.cardARCorner} data-position="bl" />
                <div className={styles.cardARCorner} data-position="br" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

GameCard.displayName = "GameCard";
