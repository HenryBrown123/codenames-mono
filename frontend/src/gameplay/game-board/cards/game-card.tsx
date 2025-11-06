import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { getTeamType, getCardColor } from "./card-utils";
import { 
  sceneVariants, 
  arRevealVariants, 
  cardStateVariants,
  CardVisibilityState 
} from "./card-animation-variants";
import styles from "./game-card.module.css";

/**
 * Card data needed for rendering
 */
interface CardDisplay {
  word: string;
  selected: boolean;
  teamName: string | null;
  cardType: string;
}

/**
 * CardFace - Front face of the card showing the word
 */
const CardFace = memo<{ word: string }>(({ word }) => {
  return (
    <div className={styles.normalCard}>
      <span className={styles.cardWord}>{word}</span>
    </div>
  );
});

CardFace.displayName = "CardFace";

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
 * ARRevealOverlay - Orchestrates its own stagger animation
 * Self-contained spymaster overlay with coordinated element animations
 */
const ARRevealOverlay = memo<{
  card: CardDisplay;
  isCurrentTeam: boolean;
}>(({ card, isCurrentTeam }) => {
  const teamType = getTeamType(card);
  
  return (
    <motion.div
      variants={arRevealVariants.container}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={styles.spymasterOverlay}
    >
      {/* Team color filter - absolute positioned, no animation needed */}
      <div className={styles.teamColorFilter} />
      
      {/* Word - centered by flex, animate from initial position */}
      <motion.span 
        className={styles.cardWord}
        variants={arRevealVariants.item}
      >
        {card.word}
      </motion.span>
      
      {/* Badge - positioned wrapper, snappy exit */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { delay: 0.16, duration: 0.4 }
        }}
        exit={{ 
          opacity: 0,
          transition: { duration: 0.15 }  // Fast exit, no delay
        }}
        style={{ 
          position: 'absolute', 
          bottom: '8px', 
          left: '50%', 
          transform: 'translateX(-50%)'
        }}
      >
        <div className={styles.teamBadge}>
          {teamType.toUpperCase()}
        </div>
      </motion.div>
      
      {/* AR Corners - absolutely positioned, snappy exit */}
      {isCurrentTeam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { delay: 0.24, duration: 0.4 }
          }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.15 }  // Fast exit, no delay
          }}
          className={styles.cardARCorners}
        >
          <div className={styles.cardARCorner} data-position="tl" />
          <div className={styles.cardARCorner} data-position="tr" />
          <div className={styles.cardARCorner} data-position="bl" />
          <div className={styles.cardARCorner} data-position="br" />
        </motion.div>
      )}
    </motion.div>
  );
});

ARRevealOverlay.displayName = "ARRevealOverlay";

interface GameCardProps {
  card: Card;
  onClick: () => void;
  clickable: boolean;
  isCurrentTeam: boolean;
  showAROverlay: boolean;
}

/**
 * GameCard - Composition layer with scene + card state orchestration
 * 
 * Structure:
 * - Outer motion.div: Participates in board orchestration (dealing)
 * - Inner motion.div: Card visibility state (flip, reveal)
 *   - CardFace: Front face (inherits fade state)
 *   - CoverCard: Back face
 *   - ARRevealOverlay: Spymaster mode (conditional)
 */
export const GameCard = memo<GameCardProps>(({ 
  card, 
  onClick, 
  clickable,
  isCurrentTeam,
  showAROverlay 
}) => {
  const teamType = getTeamType(card);
  const cardColor = getCardColor(card);
  const isClickable = !card.selected && clickable;

  // Derive card visibility state from props
  const cardState: CardVisibilityState = 
    showAROverlay ? 'revealing'
    : card.selected ? 'flipped' 
    : 'normal';

  return (
    // Scene orchestration wrapper - inherits from board
    <motion.div variants={sceneVariants.card}>
      
      {/* Card state container - controls flip + reveal */}
      <motion.div 
        className={styles.cardContainer}
        data-team={teamType}
        data-clickable={isClickable}
        data-current-team={isCurrentTeam}
        style={{
          "--team-color": cardColor,
          transformStyle: "preserve-3d"
        } as React.CSSProperties}
        initial={false}
        animate={cardState}
        variants={cardStateVariants.container}
        onClick={isClickable ? onClick : undefined}
      >
        
        {/* Front face - fades during reveal */}
        <motion.div variants={cardStateVariants.frontFace}>
          <CardFace word={card.word} />
        </motion.div>
        
        {/* Back face - CSS handles positioning + pre-rotation */}
        <CoverCard teamType={teamType} />
        
        {/* AR overlay - only visible in 'revealing' state */}
        <AnimatePresence>
          {cardState === 'revealing' && (
            <ARRevealOverlay 
              card={card}
              isCurrentTeam={isCurrentTeam}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

GameCard.displayName = "GameCard";
