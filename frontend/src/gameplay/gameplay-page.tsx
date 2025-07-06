import React from "react";
import { GameplayProvider } from "./state";
import { GameScene } from "./player-scenes";

export interface GameplayProps {
  gameId: string;
}

export const Gameplay: React.FC<GameplayProps> = ({ gameId }) => {
  return (
    <GameplayProvider gameId={gameId}>
      <GameScene />
    </GameplayProvider>
  );
};

// For backwards compatibility if needed
export { Gameplay as GameplayPageContent };