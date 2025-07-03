import React from "react";
import styled, { keyframes } from "styled-components";
import { useGameData } from "../game-data/game-data.provider";
import { usePlayerScene } from "@frontend/gameplay/role-scenes";
import { useTurn } from "@frontend/gameplay/turn-management";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { ViewOnlyBoard } from "../game-board";
import { GameInstructions } from "../game-instructions";
import { DeviceHandoffOverlay } from "../device-handoff";
import { ActionButton } from "@frontend/gameplay/shared/action-button";
import { GameData } from "@frontend/shared-types";

const GameSceneContainer = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: 150px 1fr 150px;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
`;

const InstructionsContainer = styled.div`
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  font-size: clamp(0.9rem, 2vw, 1.4rem);
  position: relative;
  margin: 0 5%; /* Just add some margin on sides */
`;

const GameBoardContainer = styled.div`
  padding: 0 5%; /* Match the margin of other containers */
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DashboardContainer = styled.div`
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  margin: 0 5%; /* Just add some margin on sides */
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
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

const ErrorContainer = styled.div`
  grid-column: 1 / -1;
  grid-row: 2;
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
  animation: ${(props) => (props.$animate ? blurOut : "none")} 0.6s ease-out;
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
          <ViewOnlyBoard />
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
