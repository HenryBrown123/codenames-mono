import React, { ReactNode } from "react";
import { GameDataProvider } from "./game-data-provider";
import { UISceneProvider } from "./ui-scene-provider";
import { GameActionsProvider } from "./game-actions-provider";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}

/**
 * Composition level component that wires up all gameplay dependencies
 * Follows the dependency chain:
 * GameData (async boundary) → UIScene (uses gameData) → GameActions (uses both)
 */
export const GameplayProvider = ({
  gameId,
  children,
}: GameplayProviderProps) => {
  return (
    <GameDataProvider gameId={gameId}>
      <UISceneProvider>
        <GameActionsProvider>{children}</GameActionsProvider>
      </UISceneProvider>
    </GameDataProvider>
  );
};
