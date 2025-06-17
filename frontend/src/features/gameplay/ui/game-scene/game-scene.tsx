import React from "react";
import { useGameData, useUIScene } from "@frontend/features/gameplay/state";
import { uiConfig } from "@frontend/features/gameplay/state/ui-state-config";
import {
  messages,
  gameBoards,
  dashboards,
  boardModeInteractivity,
} from "@frontend/features/gameplay/state/ui-state-mappings";
import { GameInstructions } from "@frontend/features/gameplay/ui/game-instructions";
import { PLAYER_ROLE } from "@codenames/shared/types";
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
  const { gameData } = useGameData();
  const { currentStage, currentScene } = useUIScene();

  const sceneConfig =
    gameData.currentRound?.status === "COMPLETED"
      ? uiConfig[PLAYER_ROLE.NONE]?.scenes["gameover"]
      : uiConfig[currentStage]?.scenes[currentScene];

  if (!sceneConfig || !gameData.playerContext) {
    console.error("No scene config found", {
      currentStage,
      currentScene,
    });
    return <div>Loading game scene...</div>;
  }

  const message = sceneConfig.message ? messages[sceneConfig.message] : null;

  const BoardComponent = sceneConfig.gameBoard
    ? gameBoards[sceneConfig.gameBoard]
    : null;
  const DashboardComponent = sceneConfig.dashboard
    ? dashboards[sceneConfig.dashboard]
    : null;

  const boardMode = sceneConfig.boardMode;
  const interactive = boardModeInteractivity[boardMode];

  return (
    <>
      {message && (
        <InstructionsContainer>
          <GameInstructions messageText={message(gameData)} />
        </InstructionsContainer>
      )}
      <GameBoardContainer>
        {BoardComponent && (
          <BoardComponent
            gameData={gameData}
            boardMode={boardMode}
            interactive={interactive}
          />
        )}
      </GameBoardContainer>
      <DashboardContainer>
        {DashboardComponent && <DashboardComponent />}
      </DashboardContainer>
    </>
  );
};
