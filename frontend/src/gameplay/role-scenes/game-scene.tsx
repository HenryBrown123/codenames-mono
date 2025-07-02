import React from "react";
import styled, { keyframes } from "styled-components";
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
  position: relative;
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

const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const RefetchIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4dabf7;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export const GameScene: React.FC = () => {
  const { gameData, isRefetching } = useGameData();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene, requiresHandoff, completeHandoff } = usePlayerScene();

  // If we're refetching and about to show handoff, show a loading state
  if (isRefetching && gameData.gameType === "SINGLE_DEVICE" && currentRole === "NONE") {
    return (
      <GameSceneContainer>
        <InstructionsContainer>
          <GameInstructions messageText="Loading next turn..." />
        </InstructionsContainer>
        <GameBoardContainer>
          <ViewOnlyBoard />
        </GameBoardContainer>
        <DashboardContainer>{/* Empty dashboard during transition */}</DashboardContainer>
      </GameSceneContainer>
    );
  }

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
          isRefetching={isRefetching}
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
        isRefetching={isRefetching}
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
  isRefetching: boolean;
}

const GameSceneContent: React.FC<GameSceneContentProps> = ({
  currentRole,
  currentScene,
  gameData,
  activeTurn,
  isRefetching,
}) => {
  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);
  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = getBoardComponent(currentRole, currentScene);

  return (
    <>
      <InstructionsContainer>
        {isRefetching && <RefetchIndicator />}
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
