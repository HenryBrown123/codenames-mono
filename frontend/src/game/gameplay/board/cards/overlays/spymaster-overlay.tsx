import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@frontend/shared/types";
import { OverlayVariants } from "../card-types";
import { TeamColorFilter, OverlayWord, TeamSymbol, ARCorners } from "./shared-components";
import styles from "../game-card.module.css";

/**
 * Card overlay showing secret colors for spymaster
 */

const containerVariants: OverlayVariants = {
  hidden: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    }
  },
  normal: {},
  flipped: {},
  revealed: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0,
    }
  },
  gameOver: {
    transition: { staggerChildren: 0 }
  },
  gameOverSelected: {
    transition: { staggerChildren: 0 }
  }
};

interface SpymasterOverlayProps {
  card: Card;
  isCurrentTeam: boolean;
}

export const SpymasterOverlay = memo<SpymasterOverlayProps>(({
  card,
  isCurrentTeam
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="revealed"
      exit="hidden"
      className={styles.revealOverlay}
    >
      <TeamColorFilter />
      <OverlayWord word={card.word} />
      <TeamSymbol />
      {isCurrentTeam && <ARCorners />}
    </motion.div>
  );
});

SpymasterOverlay.displayName = 'SpymasterOverlay';
