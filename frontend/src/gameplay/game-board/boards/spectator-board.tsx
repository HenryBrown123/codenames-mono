import React, { memo, useEffect, useRef } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { useCardVisibilityStore } from "../cards/card-visibility-store";
import { useAnimationEngine } from "../../animations/animation-engine-context";
import { GameBoardLayout } from "./board-layout";
import { EmptyCard } from "./board-layout";

/**
 * SpectatorBoard - Clean board view without interactions or overlay
 * Used for spectators and lobby/setup states
 */
export const SpectatorBoard = memo<{ tilt?: number }>(({ tilt = 0 }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const dealCardsFromStore = useCardVisibilityStore((state) => state.dealCards);
  const initializeCards = useCardVisibilityStore((state) => state.initializeCards);
  const animationEngine = useAnimationEngine();

  const prevCardsLengthRef = useRef(0);

  useEffect(() => {
    console.log("[Board] useEffect fired", {
      cardsLength: cards.length,
      prevLength: prevCardsLengthRef.current,
      cards,
      timestamp: new Date(),
    });

    if (cards.length > 0) {
      console.log("[Board] Initializing cards");
      initializeCards(cards);

      const words = cards.map((c) => c.word);
      console.log("[Board] About to deal cards", { words });
      dealCardsFromStore(words, animationEngine);
    }

    prevCardsLengthRef.current = cards.length;
  }, [cards]);

  return (
    <GameBoardLayout tilt={tilt}>
      {cards.length > 0
        ? cards.map((card, index) => (
            <GameCard
              key={card.word}
              card={card}
              index={index}
              onClick={() => {}}
              clickable={false}
              isCurrentTeam={currentTeamName === card.teamName}
            />
          ))
        : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
    </GameBoardLayout>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
