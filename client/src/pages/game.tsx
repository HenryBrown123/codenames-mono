import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styled from 'styled-components';

import { Dashboard, GameBoard, LoadingSpinner } from '@game/components';
import { GameContextProvider } from '@game/context';
import { useGameData } from '@game/api';
import GameInstructions from '@game/components/game-instructions/game-instructions';
import { GameData, Stage } from '@game/game-common-types';
import { Menu } from './menu';

const Grid = styled.div`
  position: relative;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;

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
  width: 100%;
  flex: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow: auto;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  text-align: center;
  margin: 0;

  @media (max-width: 768px) {
    flex: 1;
    font-size: 4vw;
  }

  /* Smaller font size for landscape mode on small screens */
  @media (max-width: 768px) and (orientation: landscape) {
    font-size: 2vw;
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

const DashboardContainer = styled.div`
  flex: 1.5;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: auto;

  @media (max-width: 768px) {
    flex: 1.5;
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

const queryClient = new QueryClient();

const getMessage = (gameData: GameData): string => {
  const messages = {
    intro: `Welcome to the game! Before clicking 'Play', pass the device to the codemaster of the ${gameData.settings.startingTeam} team so they can view all the colours without the codebreakers spying... good luck!`,
    codemaster: "Enter a codeword and the number of cards associated to the codeword.",
    codebreaker: "Pick your cards from the codeword."
  };

  return messages[gameData?.state?.stage] || null;
};



const CodeNamesGame: React.FC = () => {
  const [stage, setStage] = useState<Stage>("intro");
  const { data, error, isLoading, isRefetching } = useGameData(stage);

  if (isLoading || isRefetching ) {
    return <LoadingSpinner displayText={"Loading...."} />;
  }

  if (error || !data) {
    return <LoadingSpinner displayText={"Something went wrong :("} />;
  }


  return (
    <GameContextProvider value={{ gameData: data, stage, setStage }}>
      <Grid>
        <Banner>
          <Menu />
        </Banner>
        <GameContainer>
          <InstructionsContainer>
            <GameInstructions messageText={getMessage(data)} />
          </InstructionsContainer>
          <GameBoardContainer>
            <GameBoard gameData={data}/>
          </GameBoardContainer>
          <DashboardContainer>
            <Dashboard stage={stage} />
          </DashboardContainer>
        </GameContainer>
      </Grid>
    </GameContextProvider>
  );
};

export const Game: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CodeNamesGame />
    </QueryClientProvider>
  );
};
