import { memo, useMemo, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { useGameDataRequired } from "../../game-data/providers";
import { useViewMode } from "../view-mode/view-mode-context";
import { GameCard } from "../cards/game-card";
import { deriveDisplayOptions } from "../cards/card-types";
import { EmptyCard } from "./board-layout";
import { boardVariants, type SceneState } from "../cards/card-animation-variants";
import styles from "./board-layout.module.css";

/**
 * Read-only game board view for spectators
 */

export interface SpectatorBoardViewProps {
  cards: any[];
  wordsKey: string;
  dealOnEntry: boolean;
  boardAnimationState: SceneState;
  currentTeamName?: string;
  viewMode: string;
  isRoundComplete: boolean;
}

export const SpectatorBoardView = memo<SpectatorBoardViewProps>(
  ({
    cards,
    wordsKey,
    dealOnEntry,
    boardAnimationState,
    currentTeamName,
    viewMode,
    isRoundComplete,
  }) => (
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
              ? { mode: "game-over" as const, isCurrentTeam: currentTeamName === card.teamName }
              : deriveDisplayOptions({
                  viewMode,
                  isCurrentTeam: currentTeamName === card.teamName,
                  canInteract: false,
                });

            return (
              <GameCard
                key={card.word}
                card={card}
                cardIndex={index}
                onClick={() => {}}
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
  ),
);

SpectatorBoardView.displayName = "SpectatorBoardView";

export const SpectatorBoard = memo<{ scene?: string }>(({ scene }) => {
  const { gameData } = useGameDataRequired();
  const { viewMode } = useViewMode();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const wordsKey = useMemo(
    () =>
      cards
        .map((c) => c.word)
        .sort()
        .join(","),
    [cards],
  );
  const prevWordsKey = useRef(wordsKey);
  const dealOnEntry = wordsKey !== prevWordsKey.current || cards.length === 0;
  console.log("dealOnEntry ", dealOnEntry);

  useLayoutEffect(() => {
    prevWordsKey.current = wordsKey;
    console.log("wordsKey", wordsKey);
    console.log("prevWordsKey.current", prevWordsKey.current);
  });

  const isRoundComplete = gameData.currentRound?.status === "COMPLETED";
  const boardAnimationState: SceneState = isRoundComplete ? "gameOverReveal" : "visible";

  return (
    <SpectatorBoardView
      cards={cards}
      wordsKey={wordsKey}
      dealOnEntry={true}
      boardAnimationState={boardAnimationState}
      currentTeamName={currentTeamName}
      viewMode={viewMode}
      isRoundComplete={isRoundComplete}
    />
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
