import { memo, useMemo } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { useViewMode } from "../view-mode/view-mode-context";
import { useDealAnimation, type DealInitialState } from "../deal-animation-context";
import { GameCard } from "../cards/game-card";
import { deriveDisplayOptions } from "../cards/card-types";
import { EmptyCard } from "./board-layout";
import { DealingBoard } from "./dealing-board";
import { type SceneState } from "../cards/card-animation-variants";
import {
  ARGlassesHUD,
  ARVisor,
  ARGlare,
  ARScanlines,
  ARHUDContent,
} from "../cards/overlays/overlay-shared-components";
import styles from "./board-layout.module.css";

/**
 * View props — everything the board needs to render.
 * No hooks, no context access. Pure presentation.
 */
export interface GameBoardViewProps {
  cards: any[];
  wordsKey: string;
  initialState: DealInitialState;
  animateState: SceneState;
  currentTeamName?: string;
  viewMode: string;
  isRoundComplete: boolean;
  canInteract: (card: any) => boolean;
  onCardClick: (word: string) => void;
  showARHUD: boolean;
}

export const GameBoardView = memo<GameBoardViewProps>(
  ({
    cards,
    wordsKey,
    initialState,
    animateState,
    currentTeamName,
    viewMode,
    isRoundComplete,
    canInteract,
    onCardClick,
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
                    canInteract: canInteract(card),
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
    </>
  ),
);

GameBoardView.displayName = "GameBoardView";

/**
 * Connected board — wires up context and derives all props.
 * Accepts optional handlers to inject role-specific behaviour.
 */
export interface GameBoardProps {
  onCardClick?: (word: string) => void;
  canInteract?: (card: any) => boolean;
}

const noop = () => {};
const noInteract = () => false;

export const GameBoard = memo<GameBoardProps>(({
  onCardClick = noop,
  canInteract = noInteract,
}) => {
  const { gameData } = useGameDataRequired();
  const { viewMode } = useViewMode();
  const { initialState } = useDealAnimation();

  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const wordsKey = useMemo(
    () =>
      cards
        .map((c: any) => c.word)
        .sort()
        .join(","),
    [cards],
  );

  const isRoundComplete = gameData.currentRound?.status === "COMPLETED";
  const animateState: SceneState = isRoundComplete ? "gameOverReveal" : "visible";
  const showARHUD = viewMode === "spymaster";

  return (
    <GameBoardView
      cards={cards}
      wordsKey={wordsKey}
      initialState={initialState}
      animateState={animateState}
      currentTeamName={currentTeamName}
      viewMode={viewMode}
      isRoundComplete={isRoundComplete}
      canInteract={canInteract}
      onCardClick={onCardClick}
      showARHUD={showARHUD}
    />
  );
});

GameBoard.displayName = "GameBoard";
