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
  const { currentStage, currentScene } = useUIScene();

  console.log("GameScene render:", {
    currentStage,
    currentScene,
    gameStatus: gameData?.status,
    playerRole: gameData?.playerContext?.role,
  });

  const sceneConfig =
    gameData.currentRound?.status === "COMPLETED"
      ? uiConfig[PLAYER_ROLE.NONE]?.scenes["gameover"]
      : uiConfig[currentStage]?.scenes[currentScene];

  if (!sceneConfig || !gameData.playerContext) {
    console.error("No scene config found", {
      currentStage,
      currentScene,
      sceneConfig,
      playerContext: gameData?.playerContext,
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

  console.log("Dashboard lookup:", {
    dashboardKey: sceneConfig.dashboard,
    DashboardComponent: !!DashboardComponent,
    availableDashboards: Object.keys(dashboards),
  });

  const boardMode = sceneConfig.boardMode;
  const interactive = boardModeInteractivity[boardMode];

  return (
    <GameSceneContainer>
      {message && (
        <InstructionsContainer>
          <GameInstructions messageText={message(gameData)} />
        </InstructionsContainer>
      )}
      <GameBoardContainer>
        {BoardComponent && (
          <BoardComponent boardMode={boardMode} interactive={interactive} />
        )}
      </GameBoardContainer>
      <DashboardContainer>
        {DashboardComponent ? (
          <DashboardComponent />
        ) : (
          <div style={{ color: "red", padding: "1rem" }}>
            Dashboard not found: {sceneConfig.dashboard}
          </div>
        )}
      </DashboardContainer>
    </GameSceneContainer>
  );
};
