import styled from "styled-components";
import ActionButton from "./action-button";
import CodeWordInput from "./codemaster-input";
import { Stage } from "@game/game-common-types";
import { useGameContext } from "@game/context";

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

type DashboardSectionProps = {
  size: number;
};

const DashboardSection = styled.div<DashboardSectionProps>`
  flex: ${(props) => props.size};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  flex-basis: 100px; /* Ensures minimum width to prevent too small items */
`;

type DashboardProps = {
  stage: Stage;
};

export const Dashboard: React.FC<DashboardProps> = () => {
  const { gameData } = useGameContext();
  const latestRound = gameData.state.rounds[gameData.state.rounds.length - 1];
  const codeWord = latestRound?.codeword || "";
  const numberOfGuesses = latestRound?.guessesAllowed || 0;
  const winner = gameData.state.winner;

  return (
    <Grid>
      <DashboardContainer>
        <DashboardSection size={1}>
          {/* Conditionally render based on the stage */}
          {gameData.state.stage === "intro" && (
            <ActionButton onClick={() => console.log("Clicked!")} text="Play" />
          )}
          {gameData.state.stage === "codemaster" && (
            <CodeWordInput isEditable={true} />
          )}
          {gameData.state.stage === "codebreaker" && (
            <CodeWordInput
              codeWord={codeWord}
              numberOfCards={numberOfGuesses}
              isEditable={false}
            />
          )}
          {gameData.state.stage === "gameover" && (
            <ActionButton
              onClick={() => console.log("Play again clicked!")}
              text="Play again"
            />
          )}
        </DashboardSection>
      </DashboardContainer>
    </Grid>
  );
};
