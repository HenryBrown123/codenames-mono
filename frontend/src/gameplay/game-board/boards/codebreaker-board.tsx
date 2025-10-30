import { memo, useCallback, useMemo } from "react";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { GameCard } from "../cards/game-card";
import { GameBoardLayout, EmptyCard } from "./board-layout";

const CodebreakerBoardContent = memo<{
  cards: any[];
  canMakeGuess: boolean;
  isLoading: boolean;
  activeTurn: any;
  onCardClick: (word: string) => void;
  tilt: number;
  currentTeamName?: string;
  shouldAnimateDeal: boolean;
}>(({ cards, canMakeGuess, isLoading, activeTurn, onCardClick, tilt, currentTeamName, shouldAnimateDeal }) => {
  return (
    <GameBoardLayout tilt={tilt}>
        {cards.length > 0
          ? cards.map((card, index) => (
              <GameCard
                key={card.word}
                card={card}
                index={index}
                onClick={() => onCardClick(card.word)}
                clickable={canMakeGuess && !isLoading && !card.selected}
                isCurrentTeam={currentTeamName === card.teamName}
                dealOnEntry={shouldAnimateDeal}
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

    const isLoading = actionState.status === "loading";

    // Animation only plays in lobby/dealing scenes
    const shouldAnimateDeal = scene === "lobby" || scene === "dealing";

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
        shouldAnimateDeal={shouldAnimateDeal}
      />
    );
  }
);

CodebreakerBoard.displayName = "CodebreakerBoard";
