import { memo, useMemo } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { useViewMode } from "../view-mode/view-mode-context";
import { useDealAnimation, type DealInitialState } from "../deal-animation-context";
import { GameCard } from "../cards/game-card";
import { deriveDisplayOptions } from "../cards/card-types";
import { EmptyCard } from "./board-layout";
import { DealingBoard } from "./dealing-board";
import { type SceneState } from "../cards/card-animation-variants";
import styles from "./board-layout.module.css";

/**
 * Read-only game board view for spectators
 */

export interface SpectatorBoardViewProps {
  cards: any[];
  wordsKey: string;
  initialState: DealInitialState;
  animateState: SceneState;
  currentTeamName?: string;
  viewMode: string;
  isRoundComplete: boolean;
}

export const SpectatorBoardView = memo<SpectatorBoardViewProps>(
  ({ cards, wordsKey, initialState, animateState, currentTeamName, viewMode, isRoundComplete }) => (
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

SpectatorBoardView.displayName = "SpectatorBoardView";

export const SpectatorBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const { viewMode } = useViewMode();
  const { initialState } = useDealAnimation();
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

  const isRoundComplete = gameData.currentRound?.status === "COMPLETED";
  const animateState: SceneState = isRoundComplete ? "gameOverReveal" : "visible";

  return (
    <SpectatorBoardView
      cards={cards}
      wordsKey={wordsKey}
      initialState={initialState}
      animateState={animateState}
      currentTeamName={currentTeamName}
      viewMode={viewMode}
      isRoundComplete={isRoundComplete}
    />
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
