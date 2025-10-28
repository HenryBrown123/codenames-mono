import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { useCardEvent } from "../../game-data/events";
import { useViewMode } from "../view-mode/view-mode-context";
import { useCardAnimationState } from "../../use-card-animation-state";
import { getTeamType, getCardColor } from "./card-utils";
import { cx } from "../../../lib/classnames";
import styles from "./game-card.module.css";

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

    // Get next event from server event log
    const nextEvent = useCardEvent(card.word);

    // Derive animation state from events
    const animationState = useCardAnimationState(nextEvent, card.selected, viewMode);

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

    const isColored = animationState.displayState === "visible-colored";
    const showSpymasterOverlay = isColored;

    return (
      <motion.div
        initial={{ x: -200, y: -200, rotate: -45, scale: 0, opacity: 0 }}
        animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
        transition={{
          delay: index * 0.05,
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className={styles.cardContainer}
        data-team={teamType}
        data-state={animationState.displayState}
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
          onClick={clickable && !card.selected ? onClick : undefined}
          className={cx(styles.normalCard, isCurrentTeam && styles.currentTeam)}
        >
          <div className={styles.ripple} />
          <span className={cx(styles.cardWord, getTextSizeClass(card.word, threshold))}>
            {card.word}
          </span>
        </div>

        {/* Cover card - slides down on select */}
        <AnimatePresence>
          {animationState.shouldShowCover && (
            <motion.div
              initial={{ y: -150, opacity: 0, rotateY: -180, scale: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                rotateY: 0,
                scale: 1
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className={styles.coverCard}
            >
              <div className={styles.teamSymbol} data-team={teamType} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spymaster overlay */}
        <AnimatePresence>
          {showSpymasterOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className={styles.spymasterOverlay}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

GameCard.displayName = "GameCard";
