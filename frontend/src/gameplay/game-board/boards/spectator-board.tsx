import React, { memo, useEffect } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import {
  useSandboxStore,
  useSandboxCoordinator,
} from "../../../sandbox/card-visibility-sandbox.hooks";
import { GameBoardLayout } from "./board-layout";
import { EmptyCard } from "./board-layout";
export const SpectatorBoard = memo<{ tilt?: number }>(({ tilt = 0 }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  // Use sandbox store instead of game store
  const initialiseFromGameCards = useSandboxStore((state) => state.initialiseFromGameCards);
  const dealCards = useSandboxStore((state) => state.dealCards);

  // Use sandbox coordinator instead of game coordinator
  useSandboxCoordinator();

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
