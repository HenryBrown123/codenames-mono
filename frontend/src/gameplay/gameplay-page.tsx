import React from "react";
import { GameplayProvider } from "./game-data/providers";
import { GameScene } from "./game-scene";

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

export { Gameplay as GameplayPageContent };