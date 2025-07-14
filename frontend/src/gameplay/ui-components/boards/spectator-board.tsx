import React, { memo } from "react";
import { useGameDataRequired } from "../../shared/providers";
import { GameCard } from "../cards/game-card";
import { CardVisibilityProvider } from "../cards/card-visibility-provider";
import { GameBoardLayout } from "./board-layout";
import { EmptyCard } from "./board-styles";

/**
 * SpectatorBoard - Clean board view without interactions or overlay
 * Used for spectators and lobby/setup states
 */
export const SpectatorBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

  return (
    <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
      <GameBoardLayout>
        {cards.length > 0 
          ? cards.map((card, index) => (
              <GameCard
                key={card.word}
                card={card}
                index={index}
                onClick={() => {}}
                clickable={false}
                initialVisibility={isRoundSetup ? "hidden" : "visible"}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => (
              <EmptyCard key={`empty-${i}`} />
            ))
        }
      </GameBoardLayout>
    </CardVisibilityProvider>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";