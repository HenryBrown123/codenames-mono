import React from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { usePlayerScene } from "@frontend/gameplay/role-scenes";
import { useTurn } from "@frontend/gameplay/turn-management";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { ViewOnlyBoard } from "../game-board";
import { GameInstructions } from "../game-instructions";
import { DeviceHandoffOverlay } from "../device-handoff";

const GameSceneContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
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

const SkeletonPulse = styled.div`
  background: linear-gradient(
    90deg,
    rgba(65, 63, 63, 0.4) 25%,
    rgba(65, 63, 63, 0.6) 50%,
    rgba(65, 63, 63, 0.4) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 8px;

  @keyframes skeleton-pulse {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const GameSceneSkeleton: React.FC = () => (
  <>
    <InstructionsContainer>
      <SkeletonPulse style={{ width: "80%", height: "60%" }} />
    </InstructionsContainer>

    <GameBoardContainer>
      <SkeletonPulse
        style={{
          width: "90%",
          height: "80%",
          maxWidth: "min(90vw, 80vh)",
          aspectRatio: "5/4",
        }}
      />
    </GameBoardContainer>

    <DashboardContainer>
      <SkeletonPulse style={{ width: "70%", height: "50%" }} />
    </DashboardContainer>
  </>
);

export const GameScene: React.FC = () => {
  const { gameData } = useGameData();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene, requiresHandoff, completeHandoff } = usePlayerScene();

  // Handle game over state
  if (gameData.currentRound?.status === "COMPLETED") {
    return (
      <GameSceneContainer>
        <InstructionsContainer>
          <GameInstructions messageText="🎉 Game Over!" />
        </InstructionsContainer>
        <GameBoardContainer>
          <ViewOnlyBoard />
        </GameBoardContainer>
        <DashboardContainer>
          <div>Game Completed!</div>
        </DashboardContainer>
      </GameSceneContainer>
    );
  }

  if (requiresHandoff) {
    return (
      <GameSceneContainer>
        <GameSceneContent
          currentRole={currentRole}
          currentScene={currentScene}
          gameData={gameData}
          activeTurn={activeTurn}
        />

        <DeviceHandoffOverlay gameData={gameData} onContinue={completeHandoff} />
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
 * Game scene content
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
  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);
  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = getBoardComponent(currentRole, currentScene);

  return (
    <>
      <InstructionsContainer>
        <GameInstructions messageText={messageText} />
      </InstructionsContainer>

      <GameBoardContainer>
        <BoardComponent key={currentRole} />
      </GameBoardContainer>

      <DashboardContainer>
        <DashboardComponent />
      </DashboardContainer>
    </>
  );
};
