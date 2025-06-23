import React from "react";
import { GameplayProvider } from "@frontend/gameplay/state";
import { GameScene } from "@frontend/gameplay/role-scenes/game-scene";

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
