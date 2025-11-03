import { memo, useCallback, useMemo, useRef, useLayoutEffect } from "react";
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
  currentTeamName?: string;
}>(({ cards, canMakeGuess, isLoading, activeTurn, onCardClick, currentTeamName }) => {
  // Create stable key from card words (sorted for consistency)
  const wordsKey = useMemo(() =>
    cards.map(c => c.word).sort().join(","),
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
    <GameBoardLayout>
        {cards.length > 0
          ? cards.map((card, index) => (
              <GameCard
                key={card.word}
                card={card}
                index={index}
                onClick={() => onCardClick(card.word)}
                clickable={canMakeGuess && !isLoading && !card.selected}
                isCurrentTeam={currentTeamName === card.teamName}
                dealOnEntry={dealOnEntry}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
    </GameBoardLayout>
  );
});

CodebreakerBoardContent.displayName = "CodebreakerBoardContent";

export const CodebreakerBoard = memo<{ scene?: string }>(
  ({ scene }) => {
    const { gameData } = useGameDataRequired();
    const { makeGuess, actionState } = useGameActions();
    const { activeTurn } = useTurn();
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
        activeTurn={activeTurn}
        onCardClick={handleCardClick}
        currentTeamName={currentTeamName}
      />
    );
  }
);

CodebreakerBoard.displayName = "CodebreakerBoard";
