import { memo, useCallback, useMemo } from "react";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { useViewMode } from "../view-mode/view-mode-context";
import { useDealAnimation, type DealInitialState } from "../deal-animation-context";
import { GameCard } from "../cards/game-card";
import { deriveDisplayOptions } from "../cards/card-types";
import { EmptyCard } from "./board-layout";
import { DealingBoard } from "./dealing-board";
import { type SceneState } from "../cards/card-animation-variants";
import styles from "./board-layout.module.css";

/**
 * Game board view for codebreaker role with card selection
 */

export interface CodebreakerBoardViewProps {
  cards: any[];
  wordsKey: string;
  initialState: DealInitialState;
  animateState: SceneState;
  canMakeGuess: boolean;
  isLoading: boolean;
  onCardClick: (word: string) => void;
  currentTeamName?: string;
  viewMode: string;
  isRoundComplete: boolean;
}

export const CodebreakerBoardView = memo<CodebreakerBoardViewProps>(
  ({
    cards,
    wordsKey,
    initialState,
    animateState,
    canMakeGuess,
    isLoading,
    onCardClick,
    currentTeamName,
    viewMode,
    isRoundComplete,
  }) => (
    <div className={styles.boardWrapper}>
      {cards.length > 0 ? (
        <DealingBoard
          wordsKey={wordsKey}
          initialState={initialState}
          animateState={animateState}
          className={styles.boardGrid}
        >
          {cards.map((card, index) => {
            const displayOptions = isRoundComplete
              ? { mode: "game-over" as const, isCurrentTeam: currentTeamName === card.teamName }
              : deriveDisplayOptions({
                  viewMode,
                  isCurrentTeam: currentTeamName === card.teamName,
                  canInteract: canMakeGuess && !isLoading && !card.selected,
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
        </DealingBoard>
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

CodebreakerBoardView.displayName = "CodebreakerBoardView";

export const CodebreakerBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const { makeGuess, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const { viewMode } = useViewMode();
  const { initialState } = useDealAnimation();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const isLoading = actionState.status === "loading";

  const wordsKey = useMemo(
    () =>
      cards
        .map((c: any) => c.word)
        .sort()
        .join(","),
    [cards],
  );

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

  const isRoundComplete = gameData.currentRound?.status === "COMPLETED";
  const animateState: SceneState = isRoundComplete ? "gameOverReveal" : "visible";

  return (
    <CodebreakerBoardView
      cards={cards}
      wordsKey={wordsKey}
      initialState={initialState}
      animateState={animateState}
      canMakeGuess={canMakeGuess}
      isLoading={isLoading}
      onCardClick={handleCardClick}
      currentTeamName={currentTeamName}
      viewMode={viewMode}
      isRoundComplete={isRoundComplete}
    />
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";
