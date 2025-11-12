import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@frontend/shared-types';
import { getTeamType } from '../card-utils';
import {
  cardOverlayRevealVariants,
  wordPopVariants
} from './game-over-overlay-variants';
import styles from '../game-card.module.css';

interface GameOverOverlayProps {
  card: Card;
  cardIndex: number;
}

export const GameOverOverlay = memo<GameOverOverlayProps>(({ card, cardIndex }) => {
  const teamType = getTeamType(card);
  
  return (
    <motion.div
      className={styles.revealOverlay}
      custom={cardIndex}
      variants={cardOverlayRevealVariants}
      initial="idle"
      animate="revealed"
      exit="idle"
    >
      <div className={styles.teamColorFilter} />
      <motion.span 
        className={styles.cardWord}
        custom={cardIndex}
        variants={wordPopVariants}
      >
        {card.word}
      </motion.span>
    </motion.div>
  );
});

GameOverOverlay.displayName = 'GameOverOverlay';
