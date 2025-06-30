import { ReactNode } from "react";
import { GameDataProvider, useGameData } from "../game-data";
import { TurnProvider, useTurn } from "../turn-management";
import { PlayerSceneProvider } from "../role-scenes";
import { GameActionsProvider } from "../game-actions";
import { PlayerProvider, usePlayerContext } from "../player-context/player-context.provider";

interface GameplayProviderProps {
  gameId: string;
  children: ReactNode;
}

/**
 * Main gameplay provider that sets up the correct dependency hierarchy:
 * Player Context → Data → Turn → Scene Management → Actions → UI
 */
export const GameplayProvider = ({
  gameId,
  children,
}: GameplayProviderProps) => {
  return (
    <PlayerProvider>
      <GameDataProvider gameId={gameId}>
        <TurnProvider>
          <GameplaySceneProvider>
            <GameActionsProvider>{children}</GameActionsProvider>
          </GameplaySceneProvider>
        </TurnProvider>
      </GameDataProvider>
    </PlayerProvider>
  );
};

/**
 * Inner provider that handles scene management with access to all contexts
 */
const GameplaySceneProvider = ({ children }: { children: ReactNode }) => {
  const { setCurrentPlayerId } = usePlayerContext();
  const { clearActiveTurn } = useTurn();
  const { gameData } = useGameData();

  const handleTurnComplete = () => {
    console.log(`[GAMEPLAY] handleTurnComplete called, gameType: ${gameData.gameType}`);
    
    // Single device: clear player to trigger handoff
    if (gameData.gameType === "SINGLE_DEVICE") {
      console.log(`[GAMEPLAY] Clearing player context to trigger handoff`);
      setCurrentPlayerId(null);
      clearActiveTurn();
    }
    // Multi-device: could add different logic here if needed
  };

  return (
    <PlayerSceneProvider onTurnComplete={handleTurnComplete}>
      {children}
    </PlayerSceneProvider>
  );
};
