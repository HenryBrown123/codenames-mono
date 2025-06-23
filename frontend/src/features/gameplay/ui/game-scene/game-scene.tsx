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
import { SpectatorBoard } from "@frontend/features/gameplay/ui/game-board/game-board";
import { GameInstructions } from "@frontend/features/gameplay/ui/game-instructions";

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

export const GameScene: React.FC = () => {
  const { gameData } = useGameData();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene, dispatch } = usePlayerRoleScene();

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

  // Clean API - pass role and scene individually to all mapping functions
  const messageText = getSceneMessage(
    currentRole,
    currentScene,
    gameData,
    activeTurn,
  );
  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = getBoardComponent(currentRole, currentScene);

  return (
    <GameSceneContainer>
      <InstructionsContainer>
        <GameInstructions messageText={messageText} />
      </InstructionsContainer>

      <GameBoardContainer>
        <BoardComponent />
      </GameBoardContainer>

      <DashboardContainer>
        <DashboardComponent dispatch={dispatch} />
      </DashboardContainer>
    </GameSceneContainer>
  );
};
