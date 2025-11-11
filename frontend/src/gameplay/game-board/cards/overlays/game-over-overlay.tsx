import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@frontend/shared-types';
import { getTeamType } from '../card-utils';
import { 
  cardOverlayRevealVariants, 
  wordPopVariants 
} from '../../../game-over/game-over-animation-variants';
import styles from '../game-card.module.css';

interface GameOverOverlayProps {
  card: Card;
}

export const GameOverOverlay = memo<GameOverOverlayProps>(({ card }) => {
  const teamType = getTeamType(card);
  
  return (
    <motion.div
      className={styles.revealOverlay}
      variants={cardOverlayRevealVariants}
      initial="idle"
      animate="revealed"
      exit="idle"
    >
      <div className={styles.teamColorFilter} />
      <motion.span 
        className={styles.cardWord}
        variants={wordPopVariants}
      >
        {card.word}
      </motion.span>
    </motion.div>
  );
});

GameOverOverlay.displayName = 'GameOverOverlay';
