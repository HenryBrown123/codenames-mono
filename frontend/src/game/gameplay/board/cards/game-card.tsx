import { memo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@frontend/shared/types";
import { getTeamType, getCardColor } from "./card-utils";
import { CardDisplayOptions, deriveCardVariant, CardVisibilityState } from "./card-types";
import { dealCardVariants } from "../boards/dealing-board";
import { SpymasterOverlay, GameOverOverlay } from "./overlays";
import { ARCorners } from "./overlays/shared-components";
import { FloatingWord } from "./floating-word";
import { useDisplayType } from "../../layout/use-display-type";
import { TeamSymbolIcon } from "@frontend/shared/components/team-symbol-icon";
import { useTrackedAnimation } from "../tracked-animation-context";
import styles from "./game-card.module.css";

/**
 * Individual game card with selection and reveal states
 */

const CardFace = memo(() => {
  return <div className={styles.normalCard} />;
});
CardFace.displayName = "CardFace";

const CoverCard = memo<{ teamType: string; variant: CardVisibilityState; cardIndex: number; isMobile: boolean }>(
  ({ teamType, variant, cardIndex, isMobile }) => {
    const shouldShow = variant === "flipped" || variant === "gameOverSelected";
    const { onTrackedAnimationStart, onTrackedAnimationEnd } = useTrackedAnimation();
    /** Skip the initial mount animation cycle -- only track genuine post-mount flips */
    const firstRendered = useRef(false);

    /**
     * Generate a consistent random rotation based on card index.
     * Mobile: 0.5-1.5 degrees, Desktop: 2-5 degrees.
     */
    const randomValue = ((cardIndex * 37) % 101) / 100; // 0 to 1
    const magnitude = isMobile ? 0.5 + randomValue * 1 : 2 + randomValue * 3;
    const direction = (cardIndex * 17) % 2 === 0 ? 1 : -1; // Randomly flip sign
    const finalRotation = magnitude * direction;

    return (
      <motion.div
        className={`${styles.coverCard} ${styles.coverCardPositioning}`}
        data-visible={shouldShow}
        initial={
          shouldShow
            ? { x: 0, y: 0, rotate: finalRotation, opacity: 1, scale: 1 }
            : { x: "-50vw", y: "-80vh", rotate: -25, opacity: 0, scale: 0.8 }
        }
        animate={
          shouldShow
            ? { x: 0, y: 0, rotate: finalRotation, opacity: 1, scale: 1 }
            : {
                x: "-50vw",
                y: "-80vh",
                rotate: -25,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0 },
              }
        }
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 260,
          mass: 1.2,
        }}
        onAnimationStart={() => {
          if (!firstRendered.current) return;
          if (shouldShow) onTrackedAnimationStart();
        }}
        onAnimationComplete={() => {
          if (!firstRendered.current) { firstRendered.current = true; return; }
          if (shouldShow) onTrackedAnimationEnd();
        }}
      >
        {/** Team symbol with embossed effect - clean layers */}
        {(() => {
          const symbolConfig = {
            red: { char: "□", rotate: true },
            blue: { char: "□", rotate: false },
            neutral: { char: "○", rotate: false },
            assassin: { char: "☠", rotate: false },
            green: { char: "🌿", rotate: false },
          };
          const config = symbolConfig[teamType as keyof typeof symbolConfig] || {
            char: "●",
            rotate: false,
          };

          return (
            <>
              {/** Embossed depression - dark shadow */}
              <div className={styles.symbolShadow}>
                <TeamSymbolIcon symbol={config.char} rotate={config.rotate} filled />
              </div>
              {/** Crisp LED symbol */}
              <div className={styles.symbolLED}>
                <TeamSymbolIcon symbol={config.char} rotate={config.rotate} filled />
              </div>
              {/** Subtle inner glow */}
              <div className={styles.symbolGlow}>
                <TeamSymbolIcon symbol={config.char} rotate={config.rotate} filled />
              </div>
              {/** Highlight edge */}
              <div className={styles.symbolHighlight}>
                <TeamSymbolIcon symbol={config.char} rotate={config.rotate} filled />
              </div>
            </>
          );
        })()}
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
  const [isHovered, setIsHovered] = useState(false);
  const displayType = useDisplayType();
  const isMobile = displayType === "mobile";

  const variant = deriveCardVariant(displayOptions, card.selected);
  const isClickable =
    displayOptions.mode === "gameplay" && displayOptions.clickable && !card.selected;

  const isCurrentTeam = displayOptions.mode !== "gameplay" && displayOptions.isCurrentTeam;

  return (
    <motion.div variants={dealCardVariants}>
      <div
        className={styles.cardContainer}
        aria-label={card.word}
        data-team={teamType}
        data-clickable={isClickable}
        data-current-team={isCurrentTeam}
        style={
          {
            "--team-color": cardColor,
          } as React.CSSProperties
        }
        onClick={isClickable ? onClick : undefined}
        onMouseEnter={() => isClickable && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/** Base card - always visible */}
        <CardFace />

        {/** Floating word - always rendered, handles own visibility */}
        <FloatingWord word={card.word} variant={variant} />

        {/** Cover card - always rendered, animates in when flipped/selected */}
        <CoverCard teamType={teamType} variant={variant} cardIndex={cardIndex} isMobile={isMobile} />

        {/** Overlays - just backgrounds and decorations, no word management */}
        <AnimatePresence mode="wait">
          {variant === "revealed" && (
            <SpymasterOverlay key="spymaster" card={card} isCurrentTeam={isCurrentTeam} />
          )}
          {(variant === "gameOver" || variant === "gameOverSelected") && (
            <GameOverOverlay key="gameover" card={card} cardIndex={cardIndex} />
          )}
        </AnimatePresence>

        {/** Pulse effect for selected cards in game over */}
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

        {/** Hover selection effect - AR corners targeting */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.hoverOverlay}
          >
            <ARCorners />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

GameCard.displayName = "GameCard";
