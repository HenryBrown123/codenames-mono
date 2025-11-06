import { memo, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { useViewMode } from "../view-mode/view-mode-context";
import { GameCard } from "../cards/game-card";
import { EmptyCard } from "./board-layout";
import { boardVariants } from "../cards/card-animation-variants";
import styles from "./board-layout.module.css";

const CodebreakerBoardContent = memo<{
  cards: any[];
  canMakeGuess: boolean;
  isLoading: boolean;
  onCardClick: (word: string) => void;
  currentTeamName?: string;
  viewMode: string;
}>(({ cards, canMakeGuess, isLoading, onCardClick, currentTeamName, viewMode }) => {
  // Create stable key from card words (sorted for consistency)
  const wordsKey = useMemo(() =>
    cards.map((c: any) => c.word).sort().join(","),
    [cards]
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
    <div className={styles.boardWrapper}>
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
              onClick={() => onCardClick(card.word)}
              clickable={canMakeGuess && !isLoading && !card.selected}
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
  );
});

CodebreakerBoardContent.displayName = "CodebreakerBoardContent";

export const CodebreakerBoard = memo<{ scene?: string }>(
  ({ scene }) => {
    const { gameData } = useGameDataRequired();
    const { makeGuess, actionState } = useGameActions();
    const { activeTurn } = useTurn();
    const { viewMode } = useViewMode();
    const cards = gameData.currentRound?.cards || [];
    const currentTeamName = gameData.playerContext?.teamName;

    const isLoading = actionState.status === "loading";

  const canMakeGuess = useMemo(() => {
    if (gameData.playerContext?.role !== "CODEBREAKER") return false;
    if (!activeTurn || activeTurn.status !== "ACTIVE") return false;
    if (activeTurn.teamName !== gameData.playerContext.teamName) return false;
    if (!activeTurn.clue) return false;
    if (activeTurn.guessesRemaining <= 0) return false;

    return true;
  }, [gameData.playerContext, activeTurn]);

  const handleCardClick = useCallback(
    (word: string) => {
      if (!isLoading && canMakeGuess) {
        makeGuess(word);
      }
    },
    [makeGuess, isLoading, canMakeGuess],
  );

    return (
      <CodebreakerBoardContent
        cards={cards}
        canMakeGuess={canMakeGuess}
        isLoading={isLoading}
        onCardClick={handleCardClick}
        currentTeamName={currentTeamName}
        viewMode={viewMode}
      />
    );
  }
);

CodebreakerBoard.displayName = "CodebreakerBoard";
