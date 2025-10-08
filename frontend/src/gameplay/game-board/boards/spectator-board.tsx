import React, { memo, useEffect, useRef, useState, useImperativeHandle, useCallback } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { useCardVisibilityStore } from "../cards/card-visibility-store";
import { useAnimationEngine } from "../../animations/animation-engine-context";
import { GameBoardLayout } from "./board-layout";
import { EmptyCard } from "./board-layout";
export const SpectatorBoard = memo<{ tilt?: number }>(({ tilt = 0 }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const dealCardsFromStore = useCardVisibilityStore((state) => state.dealCards);
  const animationEngine = useAnimationEngine();

  const dealRequestedRef = useRef(true);

  //dealRequestedRef.current = true;

  const boardContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && dealRequestedRef.current && cards.length > 0) {
        // All child cards have rendered and registered by now!
        console.log("Animating deal", animationEngine.getEngineInfo());
        dealCardsFromStore(
          cards.map((c) => c.word),
          animationEngine,
        );
        dealRequestedRef.current = false;
      }
    },
    [cards, dealRequestedRef],
  );

  return (
    <div ref={boardContainerRef}>
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
    </div>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
