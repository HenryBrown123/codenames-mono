import { useState } from "react";
import styled from "styled-components";
import ActionButton from "../action-button/action-button";
import CodeWordInput from "./codemaster-input";
import { Stage } from "@game/game-common-types";
import { useGameContext } from "@game/context";
import { useProcessTurn } from "@game/api";

const Grid = styled.div`
  min-height: 100%; /* Ensures the grid takes at least the full height of the viewport */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px; /* Adds padding to prevent content from touching edges */
`;

const DashboardContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allows wrapping when there is not enough space */
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 20px; /* Adds spacing between items */
`;

// Components for each game stage
const IntroStage: React.FC = () => {
  const { gameData } = useGameContext();
  const { mutate: processTurn, isError } = useProcessTurn();
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);

  const handleProcessTurn = () => {
    setActionButtonEnabled(false);
    processTurn({ gameId: gameData._id, gameState: gameData.state });
  };

  return (
    <>
      <ActionButton
        onClick={handleProcessTurn}
        text="Play"
        enabled={actionButtonEnabled}
      />
      {isError && <div>Something went wrong. Please try again.</div>}
    </>
  );
};

const CodemasterStage: React.FC = () => {
  const { gameData } = useGameContext();
  const { mutate: processTurn } = useProcessTurn();

  const latestRound = gameData.state.rounds.at(-1);
  const codeWord = latestRound?.codeword || "";
  const numberOfGuesses = latestRound?.guessesAllowed || 0;

  const handleSubmit = (updatedRounds: typeof gameData.state.rounds) => {
    processTurn({
      gameId: gameData._id,
      gameState: { ...gameData.state, rounds: updatedRounds },
    });
  };

  return (
    <CodeWordInput
      isEditable={true}
      onSubmit={handleSubmit}
      codeWord={codeWord}
      numberOfCards={numberOfGuesses}
    />
  );
};

const CodebreakerStage: React.FC = () => {
  const { gameData } = useGameContext();
  const latestRound = gameData.state.rounds.at(-1);
  const codeWord = latestRound?.codeword || "";
  const numberOfGuesses = latestRound?.guessesAllowed || 0;

  return (
    <CodeWordInput
      codeWord={codeWord}
      numberOfCards={numberOfGuesses}
      isEditable={false}
    />
  );
};

const GameoverStage: React.FC = () => (
  <ActionButton
    onClick={() => console.log("Play again clicked!")}
    text="Play again"
  />
);

// Main Dashboard component
export const Dashboard: React.FC<{ stage: Stage }> = ({ stage }) => {
  return (
    <Grid>
      <DashboardContainer>
        {/* Conditionally render based on the stage */}
        {stage === "intro" && <IntroStage />}
        {stage === "codemaster" && <CodemasterStage />}
        {stage === "codebreaker" && <CodebreakerStage />}
        {stage === "gameover" && <GameoverStage />}
      </DashboardContainer>
    </Grid>
  );
};
