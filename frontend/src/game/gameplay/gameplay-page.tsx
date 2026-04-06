import React from "react";
import { useLocation } from "react-router-dom";
import { GameplayProvider } from "./providers";
import { DealAnimationProvider } from "./board/deal-animation-context";
import { GameScene } from "./layout";

/**
 * Top-level gameplay page with all providers
 */

export interface GameplayProps {
  gameId: string;
}

export const Gameplay: React.FC<GameplayProps> = ({ gameId }) => {
  const location = useLocation();
  const fromLobby = !!(location.state as { fromLobby?: boolean })?.fromLobby;

  return (
    <GameplayProvider gameId={gameId}>
      <DealAnimationProvider defaultState={fromLobby ? "hidden" : "visible"}>
        <GameScene />
      </DealAnimationProvider>
    </GameplayProvider>
  );
};

export { Gameplay as GameplayPageContent };