import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared-types";
import { getTeamType, getCardColor } from "./card-utils";
import { CardDisplayOptions, deriveCardVariant, CardVisibilityState } from "./card-types";
import { sceneVariants } from "./card-animation-variants";
import { SpymasterOverlay, GameOverOverlay } from "./overlays";
import { FloatingWord } from "./floating-word";
import styles from "./game-card.module.css";

/**
 * CardFace - Just the beige background, no word
 */
const CardFace = memo(() => {
  return <div className={styles.normalCard} />;
});
CardFace.displayName = "CardFace";

/**
 * CoverCard - Slides in from way above to cover the card when selected/flipped
 */
const CoverCard = memo<{ teamType: string; variant: CardVisibilityState }>(
  ({ teamType, variant }) => {
    return (
      <motion.div
        className={styles.coverCard}
        initial={false}
        animate={variant}
        variants={{
          normal: {
            y: -300,
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
          flipped: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], // Bouncy like dealing
            },
          },
          revealed: { y: -300, opacity: 0 },
          gameOver: { y: -300, opacity: 0 },
          gameOverSelected: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            },
          },
        }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40, // Above word (35) and overlays (30)
        }}
      >
        <div className={styles.teamSymbol} data-team={teamType} />
      </motion.div>
    );
  },
);
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
      <div
        className={styles.cardContainer}
        data-team={teamType}
        data-clickable={isClickable}
        data-current-team={isCurrentTeam}
        style={
          {
            "--team-color": cardColor,
          } as React.CSSProperties
        }
        onClick={isClickable ? onClick : undefined}
      >
        {/* Base card - always visible */}
        <CardFace />

        {/* Floating word - always rendered, handles own visibility */}
        <FloatingWord word={card.word} variant={variant} />

        {/* Cover card - slides in from top when flipped/selected */}
        <CoverCard teamType={teamType} variant={variant} />

        {/* Overlays - just backgrounds and decorations, no word management */}
        <AnimatePresence mode="wait">
          {variant === "revealed" && (
            <SpymasterOverlay key="spymaster" card={card} isCurrentTeam={isCurrentTeam} />
          )}
          {(variant === "gameOver" || variant === "gameOverSelected") && (
            <GameOverOverlay key="gameover" card={card} cardIndex={cardIndex} />
          )}
        </AnimatePresence>

        {/* Pulse effect for selected cards in game over */}
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
      </div>
    </motion.div>
  );
});

GameCard.displayName = "GameCard";
