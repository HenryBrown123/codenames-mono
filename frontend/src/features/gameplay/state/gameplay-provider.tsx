import React, { ReactNode } from "react";
import { GameDataProvider } from "./game-data-provider";
import { UISceneProvider } from "./ui-scene-provider";
import { GameActionsProvider } from "./game-actions-provider";
import { TurnProvider } from "./active-turn-provider";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}

/**
 * Composition level component that wires up all gameplay dependencies
 * Follows the dependency chain:
 * GameData (async boundary) → Turn (shared state) → UIScene (uses both) → GameActions (uses all)
 */
export const GameplayProvider = ({
  gameId,
  children,
}: GameplayProviderProps) => {
  return (
    <GameDataProvider gameId={gameId}>
      <TurnProvider>
        <UISceneProvider>
          <GameActionsProvider>{children}</GameActionsProvider>
        </UISceneProvider>
      </TurnProvider>
    </GameDataProvider>
  );
};
