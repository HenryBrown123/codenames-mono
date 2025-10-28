import { memo, useState, useEffect } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { GameBoardLayout, EmptyCard } from "./board-layout";

export const SpectatorBoard = memo<{ tilt?: number }>(({ tilt = 0 }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const [dealKey, setDealKey] = useState(0);
  const [dealOnEntry, setDealOnEntry] = useState(true);

  // When new round starts, force remount to retrigger deal animations
  useEffect(() => {
    if (cards.length > 0) {
      setDealKey((prev) => prev + 1);
      setDealOnEntry(true);

      // Reset dealOnEntry after animations complete
      // Calculation: stagger (50ms) * card count + animation duration (800ms) + buffer (200ms)
      const timer = setTimeout(() => {
        setDealOnEntry(false);
      }, cards.length * 50 + 1000);

      return () => clearTimeout(timer);
    }
  }, [gameData.currentRound?.roundNumber, cards.length]);

  return (
    <GameBoardLayout tilt={tilt}>
      {cards.length > 0
        ? cards.map((card, index) => (
            <GameCard
              key={`${dealKey}-${card.word}`}
              card={card}
              index={index}
              onClick={() => {}}
              clickable={false}
              isCurrentTeam={currentTeamName === card.teamName}
              dealOnEntry={dealOnEntry}
            />
          ))
        : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
    </GameBoardLayout>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
