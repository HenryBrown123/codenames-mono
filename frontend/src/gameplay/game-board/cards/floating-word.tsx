import { memo } from "react";
import { motion } from "framer-motion";
import { CardVisibilityState } from "./card-types";
import styles from "./game-card.module.css";

/**
 * Animated floating word with 3D tilt effect
 */

interface FloatingWordProps {
  word: string;
  variant: CardVisibilityState;
}

export const FloatingWord = memo<FloatingWordProps>(({ word, variant }) => {
  return (
    <motion.div
      initial={false}
      animate={variant}
      variants={{
        normal: { opacity: 1 },
        flipped: { opacity: 0 },
        revealed: { opacity: 0 },
        gameOver: { opacity: 0 },
        gameOverSelected: { opacity: 0, transition: { duration: 0.3 } },
      }}
      className={styles.cardLabelContainer}
    >
      <span className={styles.cardWord}>{word}</span>
    </motion.div>
  );
});

FloatingWord.displayName = "FloatingWord";
