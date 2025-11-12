import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { getTeamType, getCardColor } from "./card-utils";
import { CardDisplayOptions, deriveCardVariant } from "./card-types";
import { sceneVariants, cardStateVariants } from "./card-animation-variants";
import { SpymasterOverlay, GameOverOverlay } from "./overlays";
import styles from "./game-card.module.css";

const CardFace = memo<{ word: string; variant: string }>(({ word, variant }) => {
  return (
    <div className={styles.normalCard}>
      <motion.span
        className={styles.cardWord}
        initial={false}
        animate={variant}
        variants={{
          normal: { opacity: 1 },
          flipped: { opacity: 1 },
          revealed: { opacity: 0, transition: { duration: 0.15 } },
          gameOver: { opacity: 0, transition: { duration: 0.3 } },
          gameOverSelected: { opacity: 0, transition: { duration: 0.3 } },
        }}
      >
        {word}
      </motion.span>
    </div>
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

export const GameCard = memo<GameCardProps>(({ card, cardIndex, onClick, displayOptions }) => {
  const teamType = getTeamType(card);
  const cardColor = getCardColor(card);

  const variant = deriveCardVariant(displayOptions, card.selected);
  const isClickable =
    displayOptions.mode === "gameplay" && displayOptions.clickable && !card.selected;

  const isCurrentTeam = displayOptions.mode !== "gameplay" && displayOptions.isCurrentTeam;

  return (
    <motion.div variants={sceneVariants.card}>
      <motion.div
        className={styles.cardContainer}
        data-team={teamType}
        data-clickable={isClickable}
        data-current-team={isCurrentTeam}
        style={
          {
            "--team-color": cardColor,
            transformStyle: "preserve-3d",
          } as React.CSSProperties
        }
        initial={false}
        animate={variant}
        variants={cardStateVariants.container}
        onClick={isClickable ? onClick : undefined}
      >
        <div>
          <CardFace word={card.word} variant={variant} />
        </div>

        <CoverCard teamType={teamType} />

        <AnimatePresence mode="wait">
          {variant === "revealed" && (
            <SpymasterOverlay key="spymaster" card={card} isCurrentTeam={isCurrentTeam} />
          )}
          {(variant === "gameOver" || variant === "gameOverSelected") && (
            <GameOverOverlay key="gameover" card={card} cardIndex={cardIndex} />
          )}
        </AnimatePresence>

        {variant === "gameOverSelected" && (
          <motion.div
            className={styles.outlinePulse}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0, 1, 0, 1, 1],
              scale: [1, 1.02, 1, 1.02, 1, 1.02, 1],
            }}
            transition={{
              duration: 1.8,
              times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

GameCard.displayName = "GameCard";
