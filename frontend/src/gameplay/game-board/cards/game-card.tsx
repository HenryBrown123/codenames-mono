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
 * CoverCard - Thrown in from a single point (dealer's hand) at the top center of the screen
 */
const CoverCard = memo<{ teamType: string; variant: CardVisibilityState }>(
  ({ teamType, variant }) => {
    const shouldShow = variant === "flipped" || variant === "gameOverSelected";

    return (
      <motion.div
        className={styles.coverCard}
        initial={
          shouldShow
            ? { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
            : { x: "-50vw", y: "-80vh", rotate: -25, opacity: 0, scale: 0.8 } // Way off top-center
        }
        animate={
          shouldShow
            ? { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
            : { x: "-50vw", y: "-80vh", rotate: -25, opacity: 0, scale: 0.8, transition: { duration: 0 } }
        }
        transition={{
          type: "spring",
          damping: 25, // Higher = more resistance, slower approach to final position
          stiffness: 260, // Lower = slower overall movement
          mass: 1.2, // Higher = more inertia, heavier feel
        }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40, // Above word (35) and overlays (30)
          pointerEvents: shouldShow ? "auto" : "none", // Don't block clicks when hidden
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

        {/* Cover card - always rendered, animates in when flipped/selected */}
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
