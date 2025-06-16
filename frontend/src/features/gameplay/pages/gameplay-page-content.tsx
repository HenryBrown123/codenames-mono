import React from "react";
import { GameplayContextProvider } from "@frontend/features/gameplay/state";
import { GameScene } from "@frontend/game/ui";
import styled from "styled-components";

interface GameplayPageContentProps {
  gameId: string;
}

const GameplayPageContent: React.FC<GameplayPageContentProps> = ({
  gameId,
}) => {
  return (
    <GameplayContextProvider gameId={gameId}>
      <GameScene />
    </GameplayContextProvider>
  );
};

export default GameplayPageContent;
