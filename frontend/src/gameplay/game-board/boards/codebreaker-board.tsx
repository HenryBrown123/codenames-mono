import { memo, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { useViewMode } from "../view-mode/view-mode-context";
import { GameCard } from "../cards/game-card";
import { deriveDisplayOptions } from "../cards/card-types";
import { EmptyCard } from "./board-layout";
import { boardVariants, type SceneState } from "../cards/card-animation-variants";
import styles from "./board-layout.module.css";

/**
 * Game board view for codebreaker role with card selection
 */

export interface CodebreakerBoardViewProps {
  cards: any[];
  canMakeGuess: boolean;
  isLoading: boolean;
  onCardClick: (word: string) => void;
  currentTeamName?: string;
  viewMode: string;
  isRoundComplete: boolean;
}

export const CodebreakerBoardView = memo<CodebreakerBoardViewProps>(
  ({ cards, canMakeGuess, isLoading, onCardClick, currentTeamName, viewMode, isRoundComplete }) => {
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

  const boardAnimationState: SceneState = isRoundComplete 
    ? 'gameOverReveal'
    : 'visible';

  return (
    <div className={styles.boardWrapper}>
      {cards.length > 0 ? (
        <motion.div
          key={wordsKey}
          className={styles.boardGrid}
          variants={boardVariants}
          initial={dealOnEntry ? "hidden" : false}
          animate={boardAnimationState}
        >
          {cards.map((card, index) => {
            const displayOptions = isRoundComplete
              ? { mode: 'game-over' as const, isCurrentTeam: currentTeamName === card.teamName }
              : deriveDisplayOptions({
                  viewMode,
                  isCurrentTeam: currentTeamName === card.teamName,
                  canInteract: canMakeGuess && !isLoading && !card.selected
                });
            
            return (
              <GameCard
                key={card.word}
                card={card}
                cardIndex={index}
                onClick={() => onCardClick(card.word)}
                displayOptions={displayOptions}
              />
            );
          })}
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
  },
);

CodebreakerBoardView.displayName = "CodebreakerBoardView";

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
      <CodebreakerBoardView
        cards={cards}
        canMakeGuess={canMakeGuess}
        isLoading={isLoading}
        onCardClick={handleCardClick}
        currentTeamName={currentTeamName}
        viewMode={viewMode}
        isRoundComplete={gameData.currentRound?.status === "COMPLETED"}
      />
    );
  },
);

CodebreakerBoard.displayName = "CodebreakerBoard";
