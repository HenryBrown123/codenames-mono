import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@frontend/shared/types";
import { TeamColorFilter, OverlayWord } from "./shared-components";
import { gameOverContainerVariants } from "./game-over-overlay-variants";
import styles from "../game-card.module.css";

/**
 * Card overlay shown when game ends
 */

interface GameOverOverlayProps {
  card: Card;
  cardIndex: number;
}

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
