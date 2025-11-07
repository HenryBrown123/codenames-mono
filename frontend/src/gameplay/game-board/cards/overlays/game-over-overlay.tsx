import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@frontend/shared-types';
import { OverlayVariants } from '../card-types';
import { getTeamType } from '../card-utils';
import { TeamColorFilter, OverlayWord, TeamBadge } from './shared-components';
import styles from '../game-card.module.css';

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
    transition: { staggerChildren: 0 }
  },
  gameOver: {
    transition: { staggerChildren: 0 }
  },
  gameOverSelected: {
    transition: { staggerChildren: 0 }
  }
};

interface GameOverOverlayProps {
  card: Card;
}

export const GameOverOverlay = memo<GameOverOverlayProps>(({ card }) => {
  const teamType = getTeamType(card);
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="gameOver"
      exit="hidden"
      className={styles.revealOverlay}
    >
      <TeamColorFilter />
      <OverlayWord word={card.word} />
      <TeamBadge teamType={teamType} />
    </motion.div>
  );
});

GameOverOverlay.displayName = 'GameOverOverlay';
