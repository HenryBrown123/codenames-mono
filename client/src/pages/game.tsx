import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styled from 'styled-components';

import { Dashboard, GameBoard, LoadingSpinner } from '@game/components';
import { GameContextProvider } from '@game/context';
import { useGameData } from '@game/api';
import GameInstructions from '@game/components/game-instructions/game-instructions';

const Grid = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0; 
  display: flex;
  flex-direction: column;

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

  @media (max-width: 768px) {
    flex: 1;
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

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const GameBoardContainer = styled.div`
  flex: 3.5;
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
  flex: 2;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: auto;

  @media (max-width: 768px) {
    flex: 1.5;
  }
`;

const queryClient = new QueryClient();

export const Game: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CodeNamesGame />
    </QueryClientProvider>
  );
};

/**
 * Functional parent component containing all child components required by game.
 * This component fetches data from db via api call and passes into child components to present to the user.
 */
const CodeNamesGame: React.FC = () => {
  const { data, error, isLoading } = useGameData();

  if (isLoading) {
    return <LoadingSpinner displayText={"Loading a new game :)"} />;
  }

  if (error) {
    return <LoadingSpinner displayText={"Something went wrong :("} />;
  }

  return (
    <Grid>
      <GameContainer>
        <GameContextProvider value={data}>
          <InstructionsContainer>
            <GameInstructions messageText="Welcome to the game!" />
          </InstructionsContainer>
          <GameBoardContainer>
            <GameBoard />
          </GameBoardContainer>
          <DashboardContainer>
            <Dashboard />
          </DashboardContainer>
        </GameContextProvider>
      </GameContainer>
    </Grid>
  );
};
