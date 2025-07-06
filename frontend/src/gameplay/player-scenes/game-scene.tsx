import React from "react";
import styled, { keyframes } from "styled-components";
import { useGameDataRequired, useTurn } from "../shared/providers";
import { usePlayerScene } from "./";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { ViewOnlyBoard } from "../ui-components/boards";
import { GameInstructions } from "../ui-components/game-instructions";
import { ActionButton } from "../shared/components";

const GameSceneContainer = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;

  /* Desktop - Let board take ALL available space */
  @media (min-width: 1025px) {
    grid-template-columns: 280px 1fr;  /* Fixed sidebar, board gets rest */
    grid-template-rows: 80px 1fr;      /* Fixed header, board gets rest */
    gap: 1rem;
  }

  /* Tablet Landscape */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
    grid-template-columns: 220px 1fr;
    grid-template-rows: 70px 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  /* Mobile Landscape */
  @media (max-width: 768px) and (orientation: landscape) {
    grid-template-columns: 180px 1fr;
    grid-template-rows: 60px 1fr;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  /* Portrait modes remain the same */
  @media (max-width: 1024px) and (orientation: portrait) {
    grid-template-rows: 120px 1fr 150px;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  @media (max-width: 768px) and (orientation: portrait) {
    grid-template-rows: 100px 1fr 140px;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  @media (max-width: 480px) {
    grid-template-rows: 80px 1fr 120px;
    gap: 0.4rem;
    padding: 0.4rem;
  }
`;

const InstructionsContainer = styled.div`
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  font-size: clamp(0.9rem, 2vw, 1.4rem);
  position: relative;
  height: 100%;
  width: 95%;
  margin: 0 auto;

  /* Desktop & Landscape - Spans full width */
  @media (min-width: 769px) and (orientation: landscape) {
    grid-column: 1 / -1;
    width: 100%;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: clamp(0.8rem, 3vw, 1rem);
    border-radius: 12px;
  }
`;

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;

  @media (min-width: 769px) and (orientation: landscape) {
    grid-column: 1;
    grid-row: 2;
  }
`;

const GameBoardContainer = styled.div`
  padding: 0 5%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Desktop & Landscape - Board takes main area */
  @media (min-width: 769px) and (orientation: landscape) {
    grid-column: 2;
    grid-row: 2;
    padding: 0 2%;
  }

  @media (max-width: 768px) {
    padding: 0;
    overflow: hidden;
  }
`;

const DashboardContainer = styled.div`
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  height: 100%;
  width: 95%;
  margin: 0 auto;

  /* Desktop & Landscape - Full height in sidebar */
  @media (min-width: 769px) and (orientation: landscape) {
    width: 100%;
    height: 100%;
    margin: 0;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    border-radius: 12px;
    min-height: 100px;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
`;

const RefetchIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4dabf7;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const ErrorContainer = styled.div`
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  color: white;
`;

/**
 * Game Scene Component
 *
 * Pure UI component that renders the game interface.
 * No handoff logic - that's handled by SingleDeviceManager when needed.
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene } = usePlayerScene();

  // Show skeleton during initial load
  if (isPending && !gameData) {
    return (
      <GameSceneContainer>
        <InstructionsContainer>
          <GameInstructions messageText="" />
        </InstructionsContainer>
        <GameBoardContainer>
          <ViewOnlyBoard />
        </GameBoardContainer>
        <DashboardContainer />
      </GameSceneContainer>
    );
  }

  if (isError) {
    return (
      <GameSceneContainer>
        <ErrorContainer>
          <h2>Failed to load game</h2>
          <p>{error?.message || "Unknown error"}</p>
          <ActionButton onClick={refetch} text="Retry" enabled={true} />
        </ErrorContainer>
      </GameSceneContainer>
    );
  }

  // Handle game over state
  if (gameData?.currentRound?.status === "COMPLETED") {
    return (
      <GameSceneContainer>
        <InstructionsContainer>
          <GameInstructions messageText="🎉 Game Over!" />
        </InstructionsContainer>
        <GameBoardContainer>
          <ViewOnlyBoard />
        </GameBoardContainer>
        <DashboardContainer>
          <div>Game Completed!</div>
        </DashboardContainer>
      </GameSceneContainer>
    );
  }

  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);
  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = getBoardComponent(currentRole, currentScene);

  // Check if we should use sidebar layout
  const [isLandscape, setIsLandscape] = React.useState(
    window.matchMedia('(min-width: 769px) and (orientation: landscape)').matches
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 769px) and (orientation: landscape)');
    const handleChange = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (isLandscape) {
    return (
      <GameSceneContainer>
        <InstructionsContainer>
          {isFetching && <RefetchIndicator />}
          <GameInstructions messageText={messageText} />
        </InstructionsContainer>

        <SidebarContainer>
          <DashboardContainer>
            <DashboardComponent />
          </DashboardContainer>
        </SidebarContainer>

        <GameBoardContainer>
          <BoardComponent />
        </GameBoardContainer>
      </GameSceneContainer>
    );
  }

  // Original portrait layout
  return (
    <GameSceneContainer>
      <InstructionsContainer>
        {isFetching && <RefetchIndicator />}
        <GameInstructions messageText={messageText} />
      </InstructionsContainer>

      <GameBoardContainer>
        <BoardComponent />
      </GameBoardContainer>

      <DashboardContainer>
        <DashboardComponent />
      </DashboardContainer>
    </GameSceneContainer>
  );
};
