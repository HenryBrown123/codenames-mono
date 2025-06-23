import { ReactNode } from "react";
import { GameDataProvider } from "./game-data-provider";
import { TurnProvider } from "./active-turn-provider";
import { PlayerRoleSceneProvider } from "./ui-scene-provider";
import { GameActionsProvider } from "./game-actions-provider";

export { useGameData } from "./game-data-provider";

export { useGameActions } from "./game-actions-provider";

export type {
  ActionState,
  ActionName,
  GameActionsContextValue,
} from "./game-actions-provider";

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
