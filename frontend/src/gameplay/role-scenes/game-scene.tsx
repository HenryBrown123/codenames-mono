import React from "react";
import styled, { keyframes } from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { usePlayerScene } from "@frontend/gameplay/role-scenes";
import { useTurn } from "@frontend/gameplay/turn-management";
import { getSceneMessage } from "./scene-messages";
import {
  getDashboardComponent,
  getBoardComponent,
} from "./component-mappings";
import { ViewOnlyBoard } from "../game-board";
import { GameInstructions } from "../game-instructions";
import { DeviceHandoffOverlay } from "../device-handoff";
import { ActionButton } from "../shared";
import { GameData } from "@frontend/shared-types";

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

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
`;

const EmptyCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  color: white;
`;

const blurIn = keyframes`
  from {
    filter: blur(0px);
  }
  to {
    filter: blur(8px);
  }
`;

const blurOut = keyframes`
  from {
    filter: blur(8px);
  }
  to {
    filter: blur(0px);
  }
`;

const BlurredBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  filter: blur(8px);
  pointer-events: none;
  animation: ${blurIn} 0.6s ease-out;
`;

const GameSceneContentWrapper = styled.div<{ $animate?: boolean }>`
  width: 100%;
  height: 100%;
  animation: ${props => props.$animate ? blurOut : 'none'} 0.6s ease-out;
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
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameData();
  
  // Show skeleton during initial load
  if (isPending || !gameData) {
    return (
      <GameSceneContainer>
        <InstructionsContainer style={{ opacity: 0.5 }}>
          <GameInstructions messageText="Loading game..." />
        </InstructionsContainer>
        <GameBoardContainer>
          <BoardGrid aria-label="loading game board">
            {Array.from({ length: 25 }).map((_, i) => (
              <EmptyCard key={`skeleton-${i}`} style={{ 
                animation: `${pulse} 2s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s` 
              }} />
            ))}
          </BoardGrid>
        </GameBoardContainer>
        <DashboardContainer style={{ opacity: 0.5 }} />
      </GameSceneContainer>
    );
  }

  if (isError) {
    return (
      <GameSceneContainer>
        <ErrorContainer>
          <h2>Failed to load game</h2>
          <p>{error?.message || "Unknown error"}</p>
          <ActionButton onClick={refetch} text="Retry" enabled={true} />
        </ErrorContainer>
      </GameSceneContainer>
    );
  }

  // Now we have gameData for sure
  return <GameSceneWithData gameData={gameData} isFetching={isFetching} />;
};

interface GameSceneWithDataProps {
  gameData: GameData;
  isFetching: boolean;
}

const GameSceneWithData: React.FC<GameSceneWithDataProps> = ({ gameData, isFetching }) => {
  const { activeTurn } = useTurn();
  const {
    currentRole,
    currentScene,
    requiresHandoff,
    completeHandoff,
  } = usePlayerScene();

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
    // Show current role's board blurred during handoff
    return (
      <GameSceneContainer>
        <BlurredBackground>
          <GameSceneContent
            currentRole={currentRole}
            currentScene={currentScene}
            gameData={gameData}
            activeTurn={activeTurn}
            isRefetching={isFetching}
          />
        </BlurredBackground>
        <DeviceHandoffOverlay
          gameData={gameData}
          pendingTransition={{ stage: "NONE" as any, scene: "main" }}
          onContinue={completeHandoff}
        />
      </GameSceneContainer>
    );
  }

  // Normal gameplay - animate blur out on mount
  return (
    <GameSceneContainer>
      <GameSceneContentWrapper key={currentRole} $animate>
        <GameSceneContent
          currentRole={currentRole}
          currentScene={currentScene}
          gameData={gameData}
          activeTurn={activeTurn}
          isRefetching={isFetching}
        />
      </GameSceneContentWrapper>
    </GameSceneContainer>
  );
};

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