import { memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { useViewMode } from "../view-mode/view-mode-context";
import { getTeamType, getCardColor } from "./card-utils";
import styles from "./game-card.module.css";

interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
  isCurrentTeam: boolean;
  dealOnEntry: boolean;
}

export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, isCurrentTeam, dealOnEntry }) => {
    const { viewMode } = useViewMode();

    // Capture selected state ONLY on mount (useRef.current doesn't update)
    const initiallySelected = useRef(card.selected).current;

    const teamType = getTeamType(card);
    const cardColor = getCardColor(card);

    const isClickable = !card.selected && clickable;
    const showSpymasterOverlay = viewMode === "spymaster" && !card.selected;

    return (
      <motion.div
        // Deal animation - only runs on mount when dealOnEntry is true
        initial={
          dealOnEntry
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
          delay: dealOnEntry ? index * 0.05 : 0,
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
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front face */}
          <div className={styles.normalCard}>
            <span className={styles.cardWord}>{card.word}</span>
          </div>

          {/* Back face - revealed team color */}
          <div className={styles.coverCard}>
            <div className={styles.teamSymbol} data-team={teamType} />
          </div>
        </motion.div>

        {/* Spymaster overlay - AnimatePresence for mount/unmount */}
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
              <span className={styles.cardWord}>{card.word}</span>
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
  },
);

GameCard.displayName = "GameCard";
