import { memo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
      const timer = setTimeout(() => {
        setDealOnEntry(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [gameData.currentRound?.roundNumber]);

  return (
    <GameBoardLayout tilt={tilt}>
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </GameBoardLayout>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
