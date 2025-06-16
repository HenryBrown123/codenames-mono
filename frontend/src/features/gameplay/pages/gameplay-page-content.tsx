import React from "react";
import { useGameData } from "@frontend/game/api";
import {
  GameplayContextProvider,
  useUIState,
} from "@frontend/features/gameplay/state";
import { GameScene } from "@frontend/features/gameplay/ui/game-scene";
import { DeviceHandoffOverlay } from "@frontend/features/gameplay/device-handoff";

interface GameplayPageContentProps {
  gameId: string;
}

/**
 * Internal component that renders the appropriate UI based on state machine
 */
const GameplayContent: React.FC<{ gameData: any }> = ({ gameData }) => {
  const { showDeviceHandoff, pendingTransition, completeHandoff } =
    useUIState();

  // Show device handoff overlay when state machine requests it
  if (showDeviceHandoff && pendingTransition) {
    return (
      <>
        {/* Render faded game board in background */}
        <div
          style={{
            opacity: 0.3,
            filter: "blur(4px)",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <GameScene />
        </div>

        {/* Device handoff overlay */}
        <DeviceHandoffOverlay
          gameData={gameData}
          pendingTransition={pendingTransition}
          onContinue={completeHandoff}
        />
      </>
    );
  }

  // Normal gameplay when no handoff needed
  return <GameScene />;
};

/**
 * Main gameplay page content with integrated device handoff
 */
const GameplayPageContent: React.FC<GameplayPageContentProps> = ({
  gameId,
}) => {
  const { data: gameData } = useGameData(gameId);

  // Show loading state while game data loads
  if (!gameData?.playerContext?.role) {
    return <div>Loading game data...</div>;
  }

  return (
    <GameplayContextProvider gameId={gameId}>
      <GameplayContent gameData={gameData} />
    </GameplayContextProvider>
  );
};

export default GameplayPageContent;
