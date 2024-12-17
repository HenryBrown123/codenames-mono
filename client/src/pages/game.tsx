import React, { ReactNode } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useGameData } from "@game/api";
import { GameData } from "@game/types/game-common-types";

import {
  GameContextProvider,
  GameplayContextProvider,
  useGameplayContext,
} from "@game/state";

import GameInstructions from "@game/ui/game-instructions/game-instructions";
import { uiConfig } from "@game/state/game-state-config";
import { LoadingSpinner } from "@game/ui";
import {
  messages,
  gameBoards,
  dashboards,
} from "@game/state/game-state-mappings";
import { Menu } from "./menu";

// Styled Components with Background Image
const GameWrapper = styled.div`
  position: relative;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const GameContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
  margin-top: 30px;

  @media (max-width: 768px) {
    flex: 1;
    margin-top: 30px;
  }
`;

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
  word-wrap: break-word;
  text-overflow: ellipsis;

  @media (max-width: 768px) and (orientation: landscape) {
    font-size: clamp(0.8rem, 2vw, 2.5rem);
    padding: 0;
  }
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
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    height: 25vh;
  }
`;

const GameBoardContainer = styled.div`
  flex: 4;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 1rem;
  overflow: auto;

  @media (max-width: 768px) {
    flex: 2;
  }
`;

const Banner = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  padding: 0 10px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 100vh;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  font-size: clamp(1rem, 2vw, 1.5rem);
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 100vh;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  font-size: clamp(1rem, 2vw, 1.5rem);
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const GameLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <GameWrapper>
    <Banner>
      <Menu />
    </Banner>
    <GameContainer>{children}</GameContainer>
  </GameWrapper>
);

type CodenamesGameProps = {
  gameId: string;
};

const CodeNamesGame: React.FC<CodenamesGameProps> = ({ gameId }) => {
  const {
    data: gameData,
    error,
    isLoading,
    isRefetching,
  } = useGameData(gameId);

  if (isLoading || isRefetching) {
    return (
      <LoadingContainer>
        <LoadingSpinner displayText={"Loading...."} />
      </LoadingContainer>
    );
  }

  if (error || !gameData) {
    return (
      <ErrorContainer>
        <h2>Something went wrong :(</h2>
        <p>Please try refreshing the page.</p>
      </ErrorContainer>
    );
  }

  return (
    <GameplayContextProvider currentGameStage={gameData.state.stage}>
      <GameContextProvider value={{ gameData: gameData }}>
        <GameContent gameData={gameData} />
      </GameContextProvider>
    </GameplayContextProvider>
  );
};

const GameContent: React.FC<{ gameData: GameData }> = ({ gameData }) => {
  const { uiStage, currentScene } = useGameplayContext();

  const stageConfig = uiConfig[uiStage];
  const sceneConfig = stageConfig.scenes[currentScene];

  const message = sceneConfig.message ? messages[sceneConfig.message] : null;

  const BoardComponent = sceneConfig.gameBoard
    ? gameBoards[sceneConfig.gameBoard]
    : null;

  const DashboardComponent = sceneConfig.dashboard
    ? dashboards[sceneConfig.dashboard]
    : null;

  return (
    <GameLayout>
      {message && (
        <InstructionsContainer>
          <GameInstructions messageText={message(gameData)} />
        </InstructionsContainer>
      )}
      <GameBoardContainer>
        {BoardComponent && <BoardComponent gameData={gameData} />}
      </GameBoardContainer>
      <DashboardContainer>
        {DashboardComponent && <DashboardComponent />}
      </DashboardContainer>
    </GameLayout>
  );
};

export const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  return gameId ? <CodeNamesGame gameId={gameId} /> : null;
};
