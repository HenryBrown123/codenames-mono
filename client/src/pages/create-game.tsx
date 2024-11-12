import React, { useState } from "react";
import { useCreateNewGame } from "@game/api";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { LoadingSpinner } from "@game/components";
import { ActionButton } from "@game/components/action-button";
import { Settings, Team } from "@game/game-common-types";

export const CreateGamePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const { mutate: createNewGame, isPending: isCreatingGame } =
    useCreateNewGame();

  const navigate = useNavigate();

  const [numberOfCards, setNumberOfCards] = useState(25);
  const [startingTeam, setStartingTeam] = useState<Team>("red");
  const [numberOfAssassins, setNumberOfAssassins] = useState(1);

  const handleCreateGame = () => {
    const gameSettings: Settings = {
      numberOfCards,
      startingTeam,
      numberOfAssassins,
    };

    createNewGame(gameSettings, {
      onSuccess: (newGameData) => {
        navigate(`/game/${newGameData._id}`);
      },
      onError: (err) => {
        setError("Failed to create a new game. Please try again.");
      },
    });
  };

  return (
    <CreateGameLayout>
      <GameContainer>
        <WelcomeContainer>
          <h2>Welcome to Codenames!</h2>
          <p>
            Codenames is a word association game where players split into two
            teams and take turns giving clues to identify their team's secret
            words while avoiding the assassin. It's a game of strategy, wit, and
            deduction!
          </p>
          <SettingsContainer>
            <SettingItem>
              <label>Number of Cards</label>
              <div className="input-wrapper">
                <button
                  type="button"
                  onClick={() =>
                    setNumberOfCards((prev) => Math.max(10, prev - 1))
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  value={numberOfCards}
                  onChange={(e) => setNumberOfCards(Number(e.target.value))}
                  min="10"
                  max="50"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNumberOfCards((prev) => Math.min(50, prev + 1))
                  }
                >
                  +
                </button>
              </div>
            </SettingItem>
            <hr className="divider" />
            <SettingItem>
              <label>Starting Team</label>
              <div className="button-group">
                <Button
                  isSelected={startingTeam === "red"}
                  onClick={() => setStartingTeam("red")}
                  themeColor={(props) => props.theme.team1}
                >
                  Red
                </Button>
                <Button
                  isSelected={startingTeam === "green"}
                  onClick={() => setStartingTeam("green")}
                  themeColor={(props) => props.theme.team2}
                >
                  Green
                </Button>
              </div>
            </SettingItem>
            <hr className="divider" />
            <SettingItem>
              <label>Number of Assassins</label>
              <div className="input-wrapper">
                <button
                  type="button"
                  onClick={() =>
                    setNumberOfAssassins((prev) => Math.max(0, prev - 1))
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  value={numberOfAssassins}
                  onChange={(e) => setNumberOfAssassins(Number(e.target.value))}
                  min="0"
                  max="3"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNumberOfAssassins((prev) => Math.min(3, prev + 1))
                  }
                >
                  +
                </button>
              </div>
            </SettingItem>
            <hr className="divider" />
          </SettingsContainer>
          {isCreatingGame ? (
            <LoadingSpinner displayText={"Creating Game..."} />
          ) : (
            <ActionButton
              onClick={handleCreateGame}
              enabled={!isCreatingGame}
              text={"Start New Game"}
            ></ActionButton>
          )}
          {error && <ErrorText>{error}</ErrorText>}
        </WelcomeContainer>
      </GameContainer>
    </CreateGameLayout>
  );
};

// Styled Components with similar styling to the game page
const CreateGameLayout = styled.div`
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

const WelcomeContainer = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: clamp(1rem, 2vw, 2rem);
  text-align: center;
  padding: 1rem;
  margin: 1rem auto;
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  gap: 1rem;
  width: 100%;
  align-items: center;

  .divider {
    border: none;
    border-bottom: 1px solid #ffffff20;
    margin: 1rem 0;
    width: 80%;
  }
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
  color: #fff;
  width: 100%;

  label {
    margin-bottom: 0.5rem;
  }

  .input-wrapper,
  .button-group {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
  }

  .input-wrapper button {
    background-color: #ffffff10;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
  }

  .input-wrapper button:hover {
    background-color: #ffffff20;
  }

  .input-wrapper button:active {
    transform: scale(0.95);
  }

  input[type="number"] {
    width: 3rem;
    text-align: center;
  }
`;

const Button = styled.button<{
  isSelected: boolean;
  themeColor: (props: any) => string;
}>`
  background-color: ${(props) =>
    props.isSelected ? props.themeColor(props) : "#ffffff10"};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  max-width: 150px;

  &:hover {
    background-color: ${(props) => props.themeColor(props)};
  }
`;

const ErrorText = styled.p`
  color: red;
  margin-top: 1rem;
`;
