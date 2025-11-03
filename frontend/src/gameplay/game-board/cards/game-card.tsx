import { memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { useViewMode } from "../view-mode/view-mode-context";
import { getTeamType, getCardColor } from "./card-utils";
import styles from "./game-card.module.css";

/**
 * WordCard - Front face of the card showing the word
 */
const WordCard = memo<{ word: string; showOverlay: boolean }>(({ word, showOverlay }) => {
  return (
    <div className={styles.normalCard}>
      <motion.span 
        className={styles.cardWord}
        animate={{ opacity: showOverlay ? 0 : 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
        }}
      >
        {word}
      </motion.span>
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
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: 0.1,
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
  dealOnEntry: boolean;
}

/**
 * GameCard - Main card component with flip animation
 */
export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, isCurrentTeam, dealOnEntry }) => {
    const { viewMode } = useViewMode();

    const shouldDealAnimate = dealOnEntry;

    const initiallySelected = useRef(card.selected).current;

    const teamType = getTeamType(card);
    const cardColor = getCardColor(card);

    const isClickable = !card.selected && clickable;
    const showSpymasterOverlay = viewMode === "spymaster" && !card.selected;

    return (
      <motion.div
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
          type: "spring",
          stiffness: 260,
          damping: 20,
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
        <motion.div
          initial={{ rotateY: initiallySelected ? 180 : 0 }}
          animate={{ rotateY: card.selected ? 180 : 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 18,
          }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          <WordCard word={card.word} showOverlay={showSpymasterOverlay} />

          <CoverCard teamType={teamType} />
        </motion.div>

        {/* AnimatePresence needed for spymaster overlay exit animation */}
        <AnimatePresence>
          {showSpymasterOverlay && (
            <SpymasterOverlay word={card.word} teamType={teamType} isCurrentTeam={isCurrentTeam} />
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

GameCard.displayName = "GameCard";
