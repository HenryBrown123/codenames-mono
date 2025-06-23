import React, { useState } from "react";
import { useCreateGuestSession } from "@frontend/game-access/api";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { LoadingSpinner } from "@frontend/gameplay/ui";
import { ActionButton } from "@frontend/gameplay/ui/action-button";

export const GuestAuthPageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { mutate: createGuestSession, isPending: isCreatingSession } =
    useCreateGuestSession();

  const navigate = useNavigate();

  const handleCreateSession = () => {
    createGuestSession(undefined, {
      onSuccess: () => {
        navigate("/create-game");
      },
      onError: () => {
        setError("Failed to create a guest session. Please try again.");
      },
    });
  };

  return (
    <GuestAuthLayout>
      <AuthContainer>
        <AuthContent>
          <h2>Welcome to Codenames!</h2>
          <p>
            Before starting a new game, let's set up a quick guest session. This
            will ensure a smooth experience and keep your game progress intact.
          </p>
          {isCreatingSession ? (
            <LoadingSpinner displayText={"Creating Session..."} />
          ) : (
            <ActionButton
              onClick={handleCreateSession}
              enabled={!isCreatingSession}
              text={"Create Guest Session"}
            />
          )}
          {error && <ErrorText>{error}</ErrorText>}
        </AuthContent>
      </AuthContainer>
    </GuestAuthLayout>
  );
};

// Styled Components similar to settings page styling
const GuestAuthLayout = styled.div`
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

const AuthContainer = styled.div`
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

const AuthContent = styled.div`
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

const ErrorText = styled.p`
  color: red;
  margin-top: 1rem;
`;

export default GuestAuthPageContent;
