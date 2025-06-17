import React from "react";
import styled from "styled-components";
import { useGameData, useUIScene } from "@frontend/features/gameplay/state";
import { GameScene } from "@frontend/features/gameplay/ui/game-scene";
import { DeviceHandoffOverlay } from "../device-handoff";

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #2a2a2a;
  overflow: hidden;
`;

const BlurredBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  filter: blur(4px);
  pointer-events: none;
`;

/**
 * Gameplay page content
 * Handles device handoff overlay and main game scene rendering
 */
export const GameplayPageContent: React.FC = () => {
  const { gameData } = useGameData();
  const { showDeviceHandoff, pendingTransition, completeHandoff } =
    useUIScene();

  // Show device handoff overlay when state machine requests it
  if (showDeviceHandoff && pendingTransition) {
    return (
      <PageContainer>
        {/* Render faded game board in background */}
        <BlurredBackground>
          <GameScene />
        </BlurredBackground>

        {/* Device handoff overlay */}
        <DeviceHandoffOverlay
          gameData={gameData}
          pendingTransition={pendingTransition}
          onContinue={completeHandoff}
        />
      </PageContainer>
    );
  }

  // Normal gameplay
  return (
    <PageContainer>
      <GameScene />
    </PageContainer>
  );
};
