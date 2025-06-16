import React from "react";
import { useGameplayContext, useGameContext } from "@frontend/game/state";
import { uiConfig } from "@frontend/features/gameplay/state/ui-state-config";
import {
  messages,
  gameBoards,
  dashboards,
} from "@frontend/features/gameplay/state/ui-state-mappings";
import { GameInstructions } from "@frontend/game/ui";
import styled from "styled-components";

const InstructionsContainer = styled.div`
  width: 90%;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(0.7rem, 2vw, 2rem);
  text-align: center;
  padding: 1rem;
  margin: 1rem auto;
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
`;

const GameBoardContainer = styled.div`
  flex: 4;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 1rem;
  overflow: auto;
`;

const DashboardContainer = styled.div`
  width: 90%;
  height: 20vh;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
  padding: 1rem;
  margin: 1rem auto;
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
`;

export const GameScene: React.FC = () => {
  const { currentStage, currentScene } = useGameplayContext();
  const { gameData } = useGameContext();
  // Get configuration for current stage and scene
  const stageConfig = uiConfig[currentStage];
  const sceneConfig = stageConfig?.scenes[currentScene];

  if (!sceneConfig) {
    console.error("ERROR: No scene config found!", {
      currentStage,
      currentScene,
    });
    console.groupEnd();
    return <div>Loading game scene...</div>;
  }

  // Get components for current scene
  const message = sceneConfig.message ? messages[sceneConfig.message] : null;
  const BoardComponent = sceneConfig.gameBoard
    ? gameBoards[sceneConfig.gameBoard]
    : null;
  const DashboardComponent = sceneConfig.dashboard
    ? dashboards[sceneConfig.dashboard]
    : null;

  return (
    <>
      {message && (
        <InstructionsContainer>
          <GameInstructions messageText={message(gameData)} />
        </InstructionsContainer>
      )}
      <GameBoardContainer>
        {BoardComponent && (
          <>
            {console.log("Rendering Game Board:", sceneConfig.gameBoard)}
            <BoardComponent gameData={gameData} />
          </>
        )}
      </GameBoardContainer>
      <DashboardContainer>
        {DashboardComponent && (
          <>
            {console.log("Rendering Dashboard:", sceneConfig.dashboard)}
            <DashboardComponent />
          </>
        )}
      </DashboardContainer>
    </>
  );
};
