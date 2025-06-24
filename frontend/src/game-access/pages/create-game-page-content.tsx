import React, { useState } from "react";
import { useCreateNewGame } from "@frontend/game-access/api/query-hooks/use-create-new-game";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { LoadingSpinner, ActionButton } from "@frontend/gameplay/shared";
import {
  GAME_TYPE,
  GAME_FORMAT,
  GameType,
  GameFormat,
} from "@codenames/shared/types";

const CreateGamePageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { mutate: createNewGame, isPending: isCreatingGame } =
    useCreateNewGame();
  const navigate = useNavigate();

  // Game settings - simplified to match backend
  const [gameType, setGameType] = useState<GameType>(GAME_TYPE.SINGLE_DEVICE);
  const [gameFormat, setGameFormat] = useState<GameFormat>(GAME_FORMAT.QUICK);

  const handleCreateGame = () => {
    const payload = {
      gameType,
      gameFormat,
    };

    createNewGame(payload, {
      onSuccess: (newGameData) => {
        navigate(`/game/${newGameData.publicId}/lobby`);
      },
      onError: (err) => {
        console.error("Game creation error:", err);
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
              <label>Game Type</label>
              <div className="button-group">
                <Button
                  isSelected={gameType === GAME_TYPE.SINGLE_DEVICE}
                  onClick={() => setGameType(GAME_TYPE.SINGLE_DEVICE)}
                  themeColor={(props) => props.theme.primary}
                >
                  Single Device
                </Button>
                <Button
                  isSelected={gameType === GAME_TYPE.MULTI_DEVICE}
                  onClick={() => setGameType(GAME_TYPE.MULTI_DEVICE)}
                  themeColor={(props) => props.theme.secondary}
                >
                  Multi Device
                </Button>
              </div>
            </SettingItem>

            <hr className="divider" />

            <SettingItem>
              <label>Game Format</label>
              <div className="button-group">
                <Button
                  isSelected={gameFormat === GAME_FORMAT.QUICK}
                  onClick={() => setGameFormat(GAME_FORMAT.QUICK)}
                  themeColor={(props) => props.theme.team1}
                >
                  Quick
                </Button>
                <Button
                  isSelected={gameFormat === GAME_FORMAT.BEST_OF_THREE}
                  onClick={() => setGameFormat(GAME_FORMAT.BEST_OF_THREE)}
                  themeColor={(props) => props.theme.team2}
                >
                  Best of 3
                </Button>
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
            />
          )}
          {error && <ErrorText>{error}</ErrorText>}
        </WelcomeContainer>
      </GameContainer>
    </CreateGameLayout>
  );
};

export default CreateGamePageContent;

// Styled Components
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

  .button-group {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
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
