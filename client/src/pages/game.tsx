// Import necessary libraries and components
import React, { ReactNode, useCallback } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Dashboard, GameBoard, LoadingSpinner } from "@game/components";
import { GameContextProvider } from "@game/context";
import { useGameData, useProcessTurn } from "@game/api";
import GameInstructions from "@game/components/game-instructions/game-instructions";
import { GameData } from "@game/game-common-types";
import { STAGE } from "@game/game-common-constants";
import { Menu } from "./menu";

type GameLayoutProps = {
  children: ReactNode;
};

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => (
  <GameWrapper>
    <Banner>
      <Menu />
    </Banner>
    <GameContainer>{children}</GameContainer>
  </GameWrapper>
);

const CodeNamesGame: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const {
    data: gameData,
    error,
    isLoading,
    isRefetching,
  } = useGameData(gameId);

  const flipUnselectedCards = gameData
    ? gameData.state.stage === STAGE.CODEMASTER
    : null;
  const instructionMessageText = gameData ? getMessage(gameData) : null;

  if (isLoading || isRefetching) {
    return (
      <LoadingContainer>
        <LoadingSpinner displayText={"Loading...."} />;
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

  console.log("Returned game state on page: ", gameData);

  const displayInstructions = true;
  const displayDashboard = true;

  return (
    <GameContextProvider
      value={{
        gameData: gameData,
      }}
    >
      <GameLayout>
        {displayInstructions && (
          <InstructionsContainer>
            <GameInstructions messageText={instructionMessageText} />
          </InstructionsContainer>
        )}
        <GameBoardContainer>
          <GameBoard
            gameData={gameData}
            flipUnselectedCards={flipUnselectedCards}
          />
        </GameBoardContainer>
        {displayDashboard && (
          <DashboardContainer>
            <Dashboard stage={gameData.state.stage} />
          </DashboardContainer>
        )}
      </GameLayout>
    </GameContextProvider>
  );
};

export const Game: React.FC = () => {
  return <CodeNamesGame />;
};

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
  display: flex;
  justify-content: center;
  align-items: center; // Increased padding for better spacing
  font-size: clamp(0.7rem, 2vw, 2rem);
  text-align: center;
  padding: 1rem;
  margin: 1rem auto;
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  max-height: 200px; // Adjust max height as needed
  overflow-y: auto; // Enable scroll if content overflows vertically
  word-wrap: break-word; // Ensure long words wrap
  text-overflow: ellipsis;

  /* Smaller font size for landscape mode on small screens */
  @media (max-width: 768px) and (orientation: landscape) {
    font-size: clamp(0.8rem, 2vw, 2.5rem);
    padding: 0;
  }
`;

const DashboardContainer = styled.div`
  width: 90%; // Reduced width for space around
  flex: 1.5;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
  padding: 1rem;
  margin: 1rem auto; // Center with space around
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px; // Rounded corners
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); // Subtle shadow for depth

  @media (max-width: 768px) {
    flex: 1.5;
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
  flex-direction: column; /* Stack child elements vertically */
  justify-content: center; /* Center vertically */
  align-items: center; /* Center horizontally */
  width: 90%;
  height: 100vh; /* Full height of the viewport */
  margin: 0 auto; /* Center horizontally in the page */
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

// Utility function to display different messages based on game stage
const getMessage = (gameData: GameData): string => {
  const messages = {
    intro: `Welcome to the game! Before clicking 'Play', pass the device to the codemaster of the ${gameData?.settings.startingTeam} team so they can view all the colours without the codebreakers spying... good luck!`,
    codemaster:
      "Enter a codeword and the number of cards associated to the codeword.",
    codebreaker: "Pick your cards from the codeword.",
    gameover: `Game over, ${gameData?.state.winner} wins!`,
  };

  return messages[gameData?.state?.stage] || "";
};
