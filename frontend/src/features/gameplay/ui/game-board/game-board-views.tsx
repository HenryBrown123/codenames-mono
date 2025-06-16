import React from "react";
import GameBoard, { BoardMode } from "./game-board";
import { GameData } from "@frontend/shared-types";

interface GameBoardViewProps {
  gameData: GameData;
  boardMode: BoardMode;
  interactive?: boolean; // Keep for API compatibility, but not used
}

/**
 * Simplified GameBoardView - no more prop drilling needed!
 * GameBoard handles its own interactions via useGameActions
 */
export const GameBoardView: React.FC<GameBoardViewProps> = ({
  gameData,
  boardMode,
  interactive = false, // Kept for backwards compatibility
}) => {
  return (
    <GameBoard
      cards={gameData.currentRound?.cards || []}
      boardMode={boardMode}
    />
  );
};
