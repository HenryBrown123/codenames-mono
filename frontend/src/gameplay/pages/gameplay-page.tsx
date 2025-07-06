import React from "react";
import { GameplayProvider } from "@frontend/gameplay/state";
import { GameScene } from "../player-scenes";

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
