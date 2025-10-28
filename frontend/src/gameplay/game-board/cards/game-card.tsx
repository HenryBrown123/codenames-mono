import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { useViewMode } from "../view-mode/view-mode-context";
import { useCardAnimationEffectsV2 } from "./use-card-animation-effects-v2";
import { getTeamType, getCardColor } from "./card-utils";
import { cx } from "../../../lib/classnames";
import styles from "./game-card.module.css";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
  isCurrentTeam: boolean;
  dealOnEntry: boolean;
}

const getTextSizeClass = (word: string, threshold: number = 9): string => {
  const length = word.length;
  if (length <= threshold) return styles.textNormal;
  return styles.textLong;
};

export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, isCurrentTeam, dealOnEntry }) => {
    const { viewMode } = useViewMode();

    // Animation state machine
    const { visualState, containerControls, revealControls } = useCardAnimationEffectsV2({
      card,
      index,
      dealOnEntry,
    });

    const teamType = getTeamType(card);
    const cardColor = getCardColor(card);

    const [threshold, setThreshold] = useState(9);

    useEffect(() => {
      const updateThreshold = () => {
        const root = document.documentElement;
        const value = getComputedStyle(root).getPropertyValue("--text-length-threshold");
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
          setThreshold(parsed);
        }
      };

      updateThreshold();
      window.addEventListener("resize", updateThreshold);
      return () => window.removeEventListener("resize", updateThreshold);
    }, []);

    const isClickable = visualState === "visible" && !card.selected && clickable;
    const isColored = viewMode === "spymaster" && visualState !== "revealed";

    return (
      <motion.div
        animate={containerControls}
        className={styles.cardContainer}
        data-team={teamType}
        data-state={visualState}
        data-clickable={isClickable}
        data-current-team={isCurrentTeam ? "true" : "false"}
        style={
          {
            "--card-index": index,
            "--team-color": cardColor,
            width: "200px",
            height: "133px",
            perspective: "1000px",
            position: "relative",
            cursor: isClickable ? "pointer" : "default",
          } as React.CSSProperties
        }
        onClick={isClickable ? onClick : undefined}
      >
        {/* Card flip container */}
        <motion.div
          animate={revealControls}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front face */}
          <div className={styles.normalCard}>
            <div className={styles.ripple} />
            <span className={cx(styles.cardWord, getTextSizeClass(card.word, threshold))}>
              {card.word}
            </span>
          </div>

          {/* Back face - revealed team color */}
          <div className={styles.coverCard}>
            <div className={styles.teamSymbol} data-team={teamType} />
          </div>
        </motion.div>

        {/* Spymaster overlay - state-driven, not part of state machine */}
        <AnimatePresence>
          {isColored && (
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
