import React from "react";
import { GameplayProvider } from "./game-data/providers";
import { DealAnimationProvider } from "./game-board/deal-animation-context";
import { GameScene } from "./game-scene";

/**
 * Top-level gameplay page with all providers
 */

export interface GameplayProps {
  gameId: string;
}

export const Gameplay: React.FC<GameplayProps> = ({ gameId }) => (
  <GameplayProvider gameId={gameId}>
    <DealAnimationProvider>
      <GameScene />
    </DealAnimationProvider>
  </GameplayProvider>
);

export { Gameplay as GameplayPageContent };