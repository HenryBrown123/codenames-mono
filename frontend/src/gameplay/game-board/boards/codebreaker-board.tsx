import { memo, useCallback, useMemo, useRef } from "react";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { GameCard } from "../cards/game-card";
import { GameBoardLayout, EmptyCard } from "./board-layout";
import { useViewMode } from "../view-mode/view-mode-context";

const CodebreakerBoardContent = memo<{
  cards: any[];
  canMakeGuess: boolean;
  isLoading: boolean;
  activeTurn: any;
  onCardClick: (word: string) => void;
  tilt: number;
  currentTeamName?: string;
  boardRef: (node: HTMLDivElement | null) => void;
}>(({ cards, canMakeGuess, isLoading, activeTurn, onCardClick, tilt, currentTeamName, boardRef }) => {
  return (
    <GameBoardLayout ref={boardRef} tilt={tilt}>
        {cards.length > 0
          ? cards.map((card, index) => (
              <GameCard
                key={card.word}
                card={card}
                index={index}
                onClick={() => onCardClick(card.word)}
                clickable={canMakeGuess && !isLoading && !card.selected}
                isCurrentTeam={currentTeamName === card.teamName}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
    </GameBoardLayout>
  );
});

CodebreakerBoardContent.displayName = "CodebreakerBoardContent";

export const CodebreakerBoard = memo<{ tilt?: number; scene?: string }>(
  ({ tilt = 0, scene }) => {
    const { gameData } = useGameDataRequired();
    const { makeGuess, actionState } = useGameActions();
    const { activeTurn } = useTurn();
    const cards = gameData.currentRound?.cards || [];
    const currentTeamName = gameData.playerContext?.teamName;
    const { viewMode, setViewMode } = useViewMode();

    // Check if cards array reference changed
    const cardsRef = useRef(cards);
    console.log('[CodebreakerBoard] Cards changed?', cards !== cardsRef.current, 'Length:', cards.length);
    cardsRef.current = cards;

    const isLoading = actionState.status === "loading";

    // Callback ref to reset viewMode after board renders
    const boardRef = useCallback((node: HTMLDivElement | null) => {
      if (node && viewMode === "dealing") {
        // After the board has rendered with viewMode="dealing",
        // reset it so animations don't repeat
        requestAnimationFrame(() => {
          setViewMode("normal");
        });
      }
    }, [viewMode, setViewMode]);

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
        activeTurn={activeTurn}
        onCardClick={handleCardClick}
        tilt={tilt}
        currentTeamName={currentTeamName}
        boardRef={boardRef}
      />
    );
  }
);

CodebreakerBoard.displayName = "CodebreakerBoard";
