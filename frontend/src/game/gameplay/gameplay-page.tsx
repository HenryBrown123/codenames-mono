import React from "react";
import { useLocation } from "react-router-dom";
import { GameplayProvider } from "./providers";
import { DealAnimationProvider } from "./board/deal-animation-context";
import { GameScene } from "./layout";

/** Props for {@link Gameplay}. */
export interface GameplayProps {
  gameId: string;
}

/**
 * Top-level gameplay entry point. Mounts the gameplay provider stack,
 * primes the deal animation in `hidden` mode when the user just
 * arrived from the lobby (so the cards animate in), then renders the
 * responsive `GameScene`.
 */
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