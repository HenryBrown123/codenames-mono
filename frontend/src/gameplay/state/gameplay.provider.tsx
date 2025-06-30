import { ReactNode } from "react";
import { GameDataProvider } from "../game-data";
import { TurnProvider } from "../turn-management";
import { PlayerRoleSceneProvider } from "../role-scenes";
import { GameActionsProvider } from "../game-actions";
import { PlayerProvider } from "../player-context/player-context.provider";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}

/**
 * Main gameplay provider that sets up the correct dependency hierarchy:
 * Player Context → Data → Turn → Role/Scene Management → Actions → UI
 */
export const GameplayProvider = ({
  gameId,
  children,
}: GameplayProviderProps) => {
  return (
    <PlayerProvider>
      <GameDataProvider gameId={gameId}>
        <TurnProvider>
          <PlayerRoleSceneProvider>
            <GameActionsProvider>{children}</GameActionsProvider>
          </PlayerRoleSceneProvider>
        </TurnProvider>
      </GameDataProvider>
    </PlayerProvider>
  );
};
