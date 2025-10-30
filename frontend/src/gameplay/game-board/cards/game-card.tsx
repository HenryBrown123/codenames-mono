import { memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { useViewMode } from "../view-mode/view-mode-context";
import { getTeamType, getCardColor } from "./card-utils";
import styles from "./game-card.module.css";

/**
 * WordCard - Front face of the card showing the word
 */
const WordCard = memo<{ word: string }>(({ word }) => {
  return (
    <div className={styles.normalCard}>
      <span className={styles.cardWord}>{word}</span>
    </div>
  );
});

WordCard.displayName = "WordCard";

/**
 * CoverCard - Back face showing team color/symbol when revealed
 */
const CoverCard = memo<{ teamType: string }>(({ teamType }) => {
  return (
    <div className={styles.coverCard}>
      <div className={styles.teamSymbol} data-team={teamType} />
    </div>
  );
});

CoverCard.displayName = "CoverCard";

/**
 * SpymasterOverlay - Colored overlay shown in spymaster view
 */
const SpymasterOverlay = memo<{
  word: string;
  teamType: string;
  isCurrentTeam: boolean;
}>(({ word, teamType, isCurrentTeam }) => {
  return (
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
      <span className={styles.cardWord}>{word}</span>
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
  );
});

SpymasterOverlay.displayName = "SpymasterOverlay";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
  isCurrentTeam: boolean;
}

/**
 * GameCard - Main card component with flip animation
 */
export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, isCurrentTeam }) => {
    const { viewMode } = useViewMode();

    // Trigger deal animation when viewMode is "dealing"
    const shouldDealAnimate = viewMode === "dealing";

    // Track mount/unmount
    useEffect(() => {
      console.log(`[${card.word}] 🟢 MOUNTED`);
      return () => console.log(`[${card.word}] 🔴 UNMOUNTED`);
    }, [card.word]);

    // Capture initial selected state
    const initiallySelected = useRef(card.selected).current;

    // DEBUG: Log when card renders and what states we have
    console.log(`[${card.word}] Render:`, {
      selected: card.selected,
      initiallySelected,
      shouldAnimate: !initiallySelected && card.selected
    });

    const teamType = getTeamType(card);
    const cardColor = getCardColor(card);

    const isClickable = !card.selected && clickable;
    const showSpymasterOverlay = viewMode === "spymaster" && !card.selected;

    return (
      <motion.div
        // Deal animation - only runs when viewMode is "dealing"
        initial={
          shouldDealAnimate
            ? {
                opacity: 0,
                y: -200,
                rotate: -45,
                scale: 0,
              }
            : false
        }
        animate={{
          opacity: 1,
          y: 0,
          rotate: 0,
          scale: 1,
        }}
        transition={{
          delay: shouldDealAnimate ? index * 0.05 : 0,
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className={styles.cardContainer}
        data-team={teamType}
        data-clickable={isClickable}
        data-current-team={isCurrentTeam}
        style={
          {
            "--team-color": cardColor,
          } as React.CSSProperties
        }
        onClick={isClickable ? onClick : undefined}
      >
        {/* Card flip container */}
        <motion.div
          initial={{ rotateY: initiallySelected ? 180 : 0 }}
          animate={{ rotateY: card.selected ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onAnimationStart={() => {
            console.log(`[${card.word}] Animation START`);
          }}
          onAnimationComplete={() => {
            console.log(`[${card.word}] Animation COMPLETE`);
          }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front face */}
          <WordCard word={card.word} />

          {/* Back face - revealed team color */}
          <CoverCard teamType={teamType} />
        </motion.div>

        {/* Spymaster overlay - AnimatePresence for mount/unmount */}
        <AnimatePresence>
          {showSpymasterOverlay && (
            <SpymasterOverlay
              word={card.word}
              teamType={teamType}
              isCurrentTeam={isCurrentTeam}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

GameCard.displayName = "GameCard";
