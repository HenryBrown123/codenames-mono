import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { getTeamType, getCardColor } from "./card-utils";
import { CardDisplayOptions, deriveCardVariant, CardVisibilityState } from "./card-types";
import { sceneVariants, cardStateVariants } from "./card-animation-variants";
import { SpymasterOverlay } from "./overlays";
import styles from "./game-card.module.css";

const CardFace = memo<{ word: string; variant: CardVisibilityState; cardIndex?: number }>(({ word, variant, cardIndex }) => {
  const isGameOver = variant === 'gameOver';
  
  return (
    <motion.div 
      className={styles.normalCard}
      animate={isGameOver ? {
        background: 'var(--team-color)',
        boxShadow: [
          '0 0 20px var(--team-color)',
          '0 0 40px var(--team-color)',
          '0 0 20px var(--team-color)',
        ],
      } : {}}
      transition={{
        duration: 0.6,
        delay: isGameOver && cardIndex !== undefined ? 3.5 + (cardIndex * 0.08) : 0,
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }
      }}
    >
      <motion.span 
        className={styles.cardWord}
        animate={isGameOver ? {
          scale: 1.15,
        } : {}}
        transition={{
          duration: 0.4,
          delay: isGameOver && cardIndex !== undefined ? 3.5 + (cardIndex * 0.08) + 0.1 : 0,
        }}
      >
        {word}
      </motion.span>
    </motion.div>
  );
});
CardFace.displayName = "CardFace";

const CoverCard = memo<{ teamType: string }>(({ teamType }) => (
  <div className={styles.coverCard}>
    <div className={styles.teamSymbol} data-team={teamType} />
  </div>
));
CoverCard.displayName = "CoverCard";

interface GameCardProps {
  card: Card;
  cardIndex: number;
  onClick: () => void;
  displayOptions: CardDisplayOptions;
}

export const GameCard = memo<GameCardProps>(({ 
  card,
  cardIndex,
  onClick, 
  displayOptions 
}) => {
  const teamType = getTeamType(card);
  const cardColor = getCardColor(card);
  
  const variant = deriveCardVariant(displayOptions, card.selected);
  const isClickable = 
    displayOptions.mode === 'gameplay' && 
    displayOptions.clickable && 
    !card.selected;
  
  const isCurrentTeam = 
    displayOptions.mode !== 'gameplay' && displayOptions.isCurrentTeam;

  return (
    <motion.div variants={sceneVariants.card}>
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
        animate={variant}
        variants={cardStateVariants.container}
        onClick={isClickable ? onClick : undefined}
      >
        <motion.div variants={cardStateVariants.frontFace}>
          <CardFace word={card.word} variant={variant} cardIndex={cardIndex} />
        </motion.div>
        
        <CoverCard teamType={teamType} />
        
        <AnimatePresence mode="wait">
          {variant === 'revealed' && (
            <SpymasterOverlay 
              key="spymaster"
              card={card}
              isCurrentTeam={isCurrentTeam}
            />
          )}
        </AnimatePresence>
        
        {variant === 'gameOverSelected' && (
          <motion.div 
            className={styles.outlinePulse}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0, 1, 0, 1, 1],
              scale: [1, 1.02, 1, 1.02, 1, 1.02, 1]
            }}
            transition={{
              duration: 1.8,
              times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

GameCard.displayName = "GameCard";
