import { memo } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { GameBoardLayout, EmptyCard } from "./board-layout";

export const SpectatorBoard = memo<{ tilt?: number }>(({ tilt = 0 }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

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
              shouldDealOnMount={false}
            />
          ))
        : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
    </GameBoardLayout>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
