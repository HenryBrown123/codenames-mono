import { memo } from "react";
import { motion } from "framer-motion";
import { CardVisibilityState } from "./card-types";
import styles from "./game-card.module.css";

interface FloatingWordProps {
  word: string;
  variant: CardVisibilityState;
}

/**
 * FloatingWord - Always rendered word that floats above all card layers
 * Handles its own visibility based on card state
 */
export const FloatingWord = memo<FloatingWordProps>(({ word, variant }) => {
  return (
    <motion.div
      initial={false}
      animate={variant}
      variants={{
        normal: { opacity: 1 },
        flipped: { opacity: 0 },
        gameOverSelected: { opacity: 0, transition: { duration: 0.3 } },
      }}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 35,
        pointerEvents: "none",
        padding: "0.5rem",
      }}
    >
      <span className={styles.cardWord}>{word}</span>
    </motion.div>
  );
});

FloatingWord.displayName = "FloatingWord";
