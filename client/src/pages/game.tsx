import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styled from 'styled-components';

import { Dashboard, GameBoard, LoadingSpinner } from '@game/components';
import { GameContextProvider } from '@game/context';
import { useGameData } from '@game/api';

const Grid = styled.div`
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100%;
`;

const GameBoardContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    size: 4;
    padding: 1rem;
`;

const DashboardContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    size: 1;
`;

const GameContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
`;

const queryClient = new QueryClient();

export const Game: React.FC = () => {
    return (
        // Provide the client to your App
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
    // this is a custom hook
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
                <GameContextProvider value={data[0].data.newgame}>
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
