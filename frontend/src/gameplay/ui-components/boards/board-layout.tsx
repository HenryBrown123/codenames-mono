import React from "react";
import { BoardAspectWrapper, BoardGrid } from "./board-styles";

interface GameBoardLayoutProps {
  children: React.ReactNode;
  className?: string;
  'data-ar-mode'?: boolean;
}

/**
 * Shared board layout component that provides consistent structure
 * for all role-specific boards
 */
export const GameBoardLayout: React.FC<GameBoardLayoutProps> = ({ 
  children, 
  className,
  "data-ar-mode": dataArMode
}) => (
  <BoardAspectWrapper className={className} data-ar-mode={dataArMode}>
    <BoardGrid aria-label="game board" data-ar-mode={dataArMode}>
      {children}
    </BoardGrid>
  </BoardAspectWrapper>
);