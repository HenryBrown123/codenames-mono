import React from "react";
import { BoardAspectWrapper, BoardGrid } from "./board-styles";

interface GameBoardLayoutProps {
  children: React.ReactNode;
  className?: string;
  'data-ar-mode'?: boolean;
  tilt?: number;
  isInitialRender?: boolean;
}

/**
 * Shared board layout component that provides consistent structure
 * for all role-specific boards
 */
export const GameBoardLayout: React.FC<GameBoardLayoutProps> = ({ 
  children, 
  className,
  "data-ar-mode": dataArMode,
  tilt = 0,
  isInitialRender = false
}) => (
  <BoardAspectWrapper className={className} data-ar-mode={dataArMode} $tilt={tilt} $isInitialRender={isInitialRender}>
    <BoardGrid aria-label="game board" data-ar-mode={dataArMode}>
      {children}
    </BoardGrid>
  </BoardAspectWrapper>
);