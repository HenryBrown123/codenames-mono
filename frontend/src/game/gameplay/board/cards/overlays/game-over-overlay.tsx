import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@frontend/shared/types";
import { TeamColorFilter, OverlayWord } from "./shared-components";
import { gameOverContainerVariants } from "./game-over-overlay-variants";
import styles from "../game-card.module.css";

interface GameOverOverlayProps {
  card: Card;
  cardIndex: number;
}

/**
 * Card overlay that reveals the team colour and word at the end of
 * the round. `cardIndex` is forwarded to the dynamic stagger variant
 * so each card flips with its own delay.
 */
export const GameOverOverlay = memo<GameOverOverlayProps>(({ card, cardIndex }) => {
  return (
    <motion.div
      className={styles.revealOverlay}
      custom={cardIndex}
      variants={gameOverContainerVariants}
      initial="hidden"
      animate="gameOver"
      exit="hidden"
    >
      <TeamColorFilter />
      <OverlayWord word={card.word} />
    </motion.div>
  );
});

GameOverOverlay.displayName = "GameOverOverlay";
