import React from "react";
import { GameplayProvider } from "@frontend/features/gameplay/state";
import { GameScene } from "@frontend/features/gameplay/ui/game-scene";

interface GameplayPageContentProps {
  gameId: string;
}

export const GameplayPageContent: React.FC<GameplayPageContentProps> = ({
  gameId,
}) => {
  return (
    <GameplayProvider gameId={gameId}>
      <GameScene />
    </GameplayProvider>
  );
};
