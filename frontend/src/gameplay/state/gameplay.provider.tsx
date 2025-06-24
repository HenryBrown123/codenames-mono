import { ReactNode } from "react";
import { GameDataProvider } from "../game-data";
import { TurnProvider } from "../turn-management";
import { PlayerRoleSceneProvider } from "../role-scenes";
import { GameActionsProvider } from "../game-actions";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}

/**
 * Main gameplay provider that sets up the correct dependency hierarchy:
 * Data → Turn → Role/Scene Management → Actions → UI
 */
export const GameplayProvider = ({
  gameId,
  children,
}: GameplayProviderProps) => {
  return (
    <GameDataProvider gameId={gameId}>
      <TurnProvider>
        <PlayerRoleSceneProvider>
          <GameActionsProvider>{children}</GameActionsProvider>
        </PlayerRoleSceneProvider>
      </TurnProvider>
    </GameDataProvider>
  );
};
