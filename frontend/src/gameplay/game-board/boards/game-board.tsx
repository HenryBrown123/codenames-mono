import { memo, useMemo, useCallback, useEffect } from "react";
import type { ViewMode } from "../view-mode/view-mode-context";
import { useGameDataRequired } from "../../game-data/providers";
import { useViewMode } from "../view-mode/view-mode-context";
import { useDealAnimation, type DealInitialState } from "../deal-animation-context";
import { GameCard } from "../cards/game-card";
import { deriveDisplayOptions } from "../cards/card-types";
import { EmptyCard } from "./board-layout";
import { DealingBoard } from "./dealing-board";
import { ARCircleOverlay } from "./ar-circle-overlay";
import { type SceneState } from "../cards/card-animation-variants";
import type { Card } from "../../../shared-types";
import styles from "./board-layout.module.css";

/**
 * View props — everything the board needs to render.
 * No hooks, no context access. Pure presentation.
 */
export interface GameBoardViewProps {
  cards: Card[];
  wordsKey: string;
  initialState: DealInitialState;
  animateState: SceneState;
  currentTeamName?: string;
  viewMode: string;
  isRoundComplete: boolean;
  canInteract: (card: Card) => boolean;
  onCardClick: (word: string) => void;
  showARHUD: boolean;
  /** Whether the user has the spymaster role (can see AR overlay). */
  isSpymaster: boolean;
  onAROpenChange: (open: boolean) => void;
}

/**
 * Renders the card grid for a given viewMode.
 * Extracted so GameBoardView can render it twice:
 *  - once as the plain base layer (viewMode="normal")
 *  - once as the spymaster layer inside ARCircleOverlay (viewMode=viewMode)
 */
const CardGrid = memo<Omit<GameBoardViewProps, "showARHUD" | "isSpymaster" | "onAROpenChange">>(({
  cards,
  wordsKey,
  initialState,
  animateState,
  currentTeamName,
  viewMode,
  isRoundComplete,
  canInteract,
  onCardClick,
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
));

CardGrid.displayName = "CardGrid";

export const GameBoardView = memo<GameBoardViewProps>(({
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
  isSpymaster,
  onAROpenChange,
}) => {
  const sharedProps = {
    cards,
    wordsKey,
    initialState,
    animateState,
    currentTeamName,
    viewMode,
    isRoundComplete,
    canInteract,
    onCardClick,
  };

  return (
    /*
      position: relative wrapper gives ARCircleOverlay a containing block
      that matches the plain CardGrid exactly (flex item, inside .board padding).
    */
    <div className={styles.boardRelativeWrapper}>

      {/* Layer 1 — plain board, always visible outside the AR circle */}
      <CardGrid {...sharedProps} viewMode="normal" />

      {/* Layer 2 — spymaster board, clipped inside the draggable AR lens */}
      {/* Always mounted when spymaster — drag + toggle control position  */}
      {isSpymaster && !isRoundComplete && (
        <ARCircleOverlay isOpen={showARHUD} onOpenChange={onAROpenChange}>
          <CardGrid {...sharedProps} viewMode="spymaster" initialState="visible" />
        </ARCircleOverlay>
      )}

    </div>
  );
});

GameBoardView.displayName = "GameBoardView";

/**
 * Connected board — wires up context and derives all props.
 */
export interface GameBoardProps {
  onCardClick?: (word: string) => void;
  canInteract?: (card: Card) => boolean;
}

const noop = () => {};
const noInteract = () => false;

export const GameBoard = memo<GameBoardProps>(({
  onCardClick = noop,
  canInteract = noInteract,
}) => {
  const { gameData }     = useGameDataRequired();
  const { viewMode, setViewMode } = useViewMode();
  const { initialState } = useDealAnimation();

  const cards           = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;
  const isRoundComplete = gameData.currentRound?.status === "COMPLETED";
  const animateState: SceneState = isRoundComplete ? "gameOverReveal" : "visible";
  const showARHUD       = viewMode === "spymaster";
  const isSpymaster     = gameData.playerContext?.role === "CODEMASTER";

  const wordsKey = useMemo(
    () => cards.map((c) => c.word).sort().join(","),
    [cards],
  );

  const handleAROpenChange = useCallback(
    (open: boolean) => setViewMode(open ? "spymaster" : "normal" as ViewMode),
    [setViewMode],
  );

  // Reset AR view when game ends so it doesn't persist into the next round
  useEffect(() => {
    if (isRoundComplete && viewMode === "spymaster") {
      setViewMode("normal" as ViewMode);
    }
  }, [isRoundComplete, viewMode, setViewMode]);

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
      isSpymaster={!!isSpymaster}
      onAROpenChange={handleAROpenChange}
    />
  );
});

GameBoard.displayName = "GameBoard";
