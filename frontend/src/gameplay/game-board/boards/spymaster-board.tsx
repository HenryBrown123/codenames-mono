import { memo, useMemo } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { deriveDisplayOptions } from "../cards/card-types";
import { useViewMode } from "../view-mode/view-mode-context";
import { useDealAnimation, type DealInitialState } from "../deal-animation-context";
import { EmptyCard } from "./board-layout";
import { DealingBoard } from "./dealing-board";
import { type SceneState } from "../cards/card-animation-variants";
import styles from "./board-layout.module.css";
import {
  ARGlassesHUD,
  ARVisor,
  ARGlare,
  ARScanlines,
  ARHUDContent,
} from "../cards/overlays/overlay-shared-components";

/**
 * Game board view for spymaster with color reveals
 */

export interface SpymasterBoardViewProps {
  cards: any[];
  wordsKey: string;
  initialState: DealInitialState;
  animateState: SceneState;
  currentTeamName?: string;
  viewMode: string;
  isRoundComplete: boolean;
  showARHUD: boolean;
}

export const SpymasterBoardView = memo<SpymasterBoardViewProps>(
  ({
    cards,
    wordsKey,
    initialState,
    animateState,
    currentTeamName,
    viewMode,
    isRoundComplete,
    showARHUD,
  }) => (
    <>
      {showARHUD && (
        <ARGlassesHUD>
          <ARVisor />
          <ARGlare />
          <ARScanlines />
          <ARHUDContent />
        </ARGlassesHUD>
      )}

      <div className={styles.boardWrapper} data-ar-mode={showARHUD}>
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
    </>
  ),
);

SpymasterBoardView.displayName = "SpymasterBoardView";

export const SpymasterBoard = memo(() => {
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
  const showARHUD = viewMode === "spymaster";

  return (
    <SpymasterBoardView
      cards={cards}
      wordsKey={wordsKey}
      initialState={initialState}
      animateState={animateState}
      currentTeamName={currentTeamName}
      viewMode={viewMode}
      isRoundComplete={isRoundComplete}
      showARHUD={showARHUD}
    />
  );
});

SpymasterBoard.displayName = "SpymasterBoard";
