import { memo, useMemo, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { useViewMode } from "../view-mode/view-mode-context";
import { EmptyCard } from "./board-layout";
import { boardVariants } from "../cards/card-animation-variants";
import styles from "./board-layout.module.css";
import {
  ARGlassesHUD,
  ARVisor,
  ARGlare,
  ARScanlines,
  ARHUDContent,
} from "../cards/ar-overlay-components";

export const SpymasterBoard = memo<{ scene?: string }>(({ scene }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;
  const { viewMode } = useViewMode();

  // Create stable key from card words (sorted for consistency)
  const wordsKey = useMemo(
    () =>
      cards
        .map((c) => c.word)
        .sort()
        .join(","),
    [cards],
  );

  // Track previous words to detect changes
  const prevWordsKey = useRef(wordsKey);

  // Deal animation should trigger when words change
  const dealOnEntry = wordsKey !== prevWordsKey.current && cards.length > 0;

  // Update ref after render (so next render sees current words as "previous")
  useLayoutEffect(() => {
    prevWordsKey.current = wordsKey;
  });

  return (
    <>
      {viewMode === "spymaster" && (
        <ARGlassesHUD>
          <ARVisor />
          <ARGlare />
          <ARScanlines />
          <ARHUDContent />
        </ARGlassesHUD>
      )}

      <div 
        className={styles.boardWrapper}
        data-ar-mode={viewMode === "spymaster"}
      >
        {cards.length > 0 ? (
          <motion.div
            key={wordsKey}
            className={styles.boardGrid}
            variants={boardVariants}
            initial={dealOnEntry ? "hidden" : false}
            animate="visible"
          >
            {cards.map((card) => (
              <GameCard
                key={card.word}
                card={card}
                onClick={() => {}}
                clickable={false}
                isCurrentTeam={currentTeamName === card.teamName}
                showAROverlay={viewMode === "spymaster" && !card.selected}
              />
            ))}
          </motion.div>
        ) : (
          <div className={styles.boardGrid}>
            {Array.from({ length: 25 }).map((_, i) => (
              <EmptyCard key={`empty-${i}`} />
            ))}
          </div>
        )}
      </div>
    </>
  );
});

SpymasterBoard.displayName = "SpymasterBoard";
