import React from "react";
import { useGameplayContext } from "@frontend/features/gameplay/state";
import GameBoard, { BoardMode } from "./game-board";
import { GameData } from "@frontend/shared-types";

interface GameBoardViewProps {
  gameData: GameData;
  boardMode: BoardMode;
  interactive?: boolean;
}

export const GameBoardView: React.FC<GameBoardViewProps> = ({
  gameData,
  boardMode,
  interactive = false,
}) => {
  const { handleMakeGuess } = useGameplayContext();

  const handleCardClick = interactive ? handleMakeGuess : undefined;

  return (
    <GameBoard
      cards={gameData.currentRound?.cards || []}
      boardMode={boardMode}
      onCardClick={handleCardClick}
    />
  );
};
