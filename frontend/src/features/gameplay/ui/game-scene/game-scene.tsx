import React from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/features/gameplay/state";
import { usePlayerRoleScene } from "@frontend/features/gameplay/state";
import { useTurn } from "@frontend/features/gameplay/state/active-turn-provider";
import { getSceneMessage } from "@frontend/features/gameplay/state/scene-message-mappings";
import {
  getDashboardComponent,
  getBoardComponent,
} from "@frontend/features/gameplay/state/component-mappings";
import { SpectatorBoard } from "../game-board/game-board";
import { GameInstructions } from "@frontend/features/gameplay/ui/game-instructions";
import { DeviceHandoffOverlay } from "../../device-handoff";

const GameSceneContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const InstructionsContainer = styled.div`
  flex: 0 0 auto;
  width: 90%;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(0.7rem, 2vw, 2rem);
  text-align: center;
  padding: 1rem;
  margin: 1rem auto 0;
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
`;

const GameBoardContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow: hidden;
`;

const DashboardContainer = styled.div`
  flex: 0 0 auto;
  width: 90%;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  margin: 0 auto 1rem;
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
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

export const GameScene: React.FC = () => {
  const { gameData } = useGameData();
  const { activeTurn } = useTurn();
  const {
    currentRole,
    currentScene,
    showHandoff,
    pendingTransition,
    completeHandoff,
  } = usePlayerRoleScene();

  // Handle game over state
  if (gameData.currentRound?.status === "COMPLETED") {
    return (
      <GameSceneContainer>
        <InstructionsContainer>
          <GameInstructions messageText="🎉 Game Over!" />
        </InstructionsContainer>
        <GameBoardContainer>
          <SpectatorBoard />
        </GameBoardContainer>
        <DashboardContainer>
          <div>Game Completed!</div>
        </DashboardContainer>
      </GameSceneContainer>
    );
  }

  if (showHandoff && pendingTransition) {
    return (
      <GameSceneContainer>
        <BlurredBackground>
          <GameSceneContent
            currentRole={currentRole}
            currentScene={currentScene}
            gameData={gameData}
            activeTurn={activeTurn}
          />
        </BlurredBackground>
        <DeviceHandoffOverlay
          gameData={gameData}
          pendingTransition={pendingTransition}
          onContinue={completeHandoff}
        />
      </GameSceneContainer>
    );
  }

  // Normal gameplay
  return (
    <GameSceneContainer>
      <GameSceneContent
        currentRole={currentRole}
        currentScene={currentScene}
        gameData={gameData}
        activeTurn={activeTurn}
      />
    </GameSceneContainer>
  );
};

/**
 * Extracted game scene content to avoid duplication
 */
interface GameSceneContentProps {
  currentRole: string;
  currentScene: string;
  gameData: any;
  activeTurn: any;
}

const GameSceneContent: React.FC<GameSceneContentProps> = ({
  currentRole,
  currentScene,
  gameData,
  activeTurn,
}) => {
  const messageText = getSceneMessage(
    currentRole,
    currentScene,
    gameData,
    activeTurn,
  );
  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = getBoardComponent(currentRole, currentScene);

  return (
    <>
      <InstructionsContainer>
        <GameInstructions messageText={messageText} />
      </InstructionsContainer>

      <GameBoardContainer>
        <BoardComponent />
      </GameBoardContainer>

      <DashboardContainer>
        <DashboardComponent />
      </DashboardContainer>
    </>
  );
};
