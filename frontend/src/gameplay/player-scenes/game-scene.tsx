import React from "react";
import styled, { keyframes } from "styled-components";
import { useGameDataRequired, useTurn } from "../shared/providers";
import { usePlayerScene } from "./";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { ViewOnlyBoard } from "../ui-components/boards";
import { ActionButton } from "../shared/components";
import { GameInstructions } from "../ui-components/game-instructions";
import { designSystemTheme, panelStyles, glitchAnimation } from "../shared/design-system-theme";

const GameSceneContainer = styled.div`
  height: 100vh;
  display: grid;
  padding: ${designSystemTheme.space.md};
  gap: ${designSystemTheme.space.md};
  transition: all 0.3s ease;
  background:
    radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
    ${designSystemTheme.colors.background};
  color: ${designSystemTheme.colors.text};
  font-family: ${designSystemTheme.font.family};
  overflow: hidden;

  @media (min-width: 1200px) {
    grid-template-columns: 300px 1fr;
    grid-template-rows: 1fr;
  }

  @media (max-width: 1199px) {
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-columns: 1fr;
    gap: ${designSystemTheme.space.sm};
    padding: ${designSystemTheme.space.sm};
  }

  &.instructions-hidden {
    grid-template-rows: 0fr minmax(0, 1fr) auto;
  }

  /* Scanline effect overlay */
  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.01) 2px,
      rgba(255, 255, 255, 0.01) 4px
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const MobileHeader = styled.header`
  ${panelStyles}
  display: flex;
  flex-direction: column;
  gap: ${designSystemTheme.space.md};
  transition: all 0.3s ease;
  
  @media (min-width: 1200px) {
    display: none !important;
  }
  
  .instructions-hidden & {
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
    height: 0;
    min-height: 0;
    padding: 0;
    margin: 0;
  }
  
  h3 {
    ${glitchAnimation}
    margin: 0;
  }
  
  p {
    color: ${designSystemTheme.colors.textMuted};
    margin: 0;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${designSystemTheme.space.lg};
  
  @media (max-width: 1199px) {
    display: none !important;
  }
`;

const BoardArea = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: ${designSystemTheme.radius.lg};
  padding: ${designSystemTheme.space.xl};
  min-height: 0;
  background: linear-gradient(
    90deg,
    #8b6939 0%,
    #a0743f 20%,
    #7d5d33 40%,
    #946b3a 60%,
    #8b6939 80%,
    #a0743f 100%
  );
  border: 1px solid ${designSystemTheme.colors.border};
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  
  @media (max-width: 768px) {
    padding: ${designSystemTheme.space.md};
  }
  
  @media (max-width: 480px) {
    padding: ${designSystemTheme.space.sm};
  }
`;

const MobileDashboard = styled.div`
  ${panelStyles}
  display: flex;
  flex-direction: column;
  gap: ${designSystemTheme.space.md};
  
  @media (min-width: 1200px) {
    display: none !important;
  }
`;

const Panel = styled.div`
  ${panelStyles}
  
  h3 {
    ${glitchAnimation}
  }
`;

const HelpButton = styled.button`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid ${designSystemTheme.colors.border};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${designSystemTheme.colors.primary};
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.active {
    background: ${designSystemTheme.colors.primary};
    color: #000000;
    transform: rotate(180deg);
  }
  
  @media (min-width: 1200px) {
    display: none !important;
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
  const [instructionsHidden, setInstructionsHidden] = React.useState(false);

  // Show skeleton during initial load
  if (isPending && !gameData) {
    return (
      <GameSceneContainer>
        <MobileHeader>
          <h3>Mission Briefing</h3>
          <p>Loading game data...</p>
        </MobileHeader>
        <BoardArea>
          <ViewOnlyBoard />
        </BoardArea>
        <MobileDashboard />
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
        <MobileHeader>
          <h3>Mission Briefing</h3>
          <p>🎉 Game Over!</p>
        </MobileHeader>
        <Sidebar>
          <Panel>
            <h3>Mission Complete</h3>
            <p>🎉 Game Over!</p>
          </Panel>
        </Sidebar>
        <BoardArea>
          <ViewOnlyBoard />
        </BoardArea>
        <MobileDashboard>
          <div>Game Completed!</div>
        </MobileDashboard>
      </GameSceneContainer>
    );
  }

  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);
  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = getBoardComponent(currentRole, currentScene);

  return (
    <GameSceneContainer className={instructionsHidden ? "instructions-hidden" : ""}>
      {/* Mobile Header */}
      <MobileHeader>
        {isFetching && <RefetchIndicator />}
        <h3>Mission Briefing</h3>
        <p>{messageText}</p>
      </MobileHeader>

      {/* Desktop Sidebar */}
      <Sidebar>
        <Panel>
          <GameInstructions messageText={messageText} />
        </Panel>
        
        <Panel>
          <DashboardComponent />
        </Panel>
      </Sidebar>

      {/* Board Area */}
      <BoardArea>
        <BoardComponent />
      </BoardArea>

      {/* Mobile Dashboard */}
      <MobileDashboard>
        <DashboardComponent />
      </MobileDashboard>
      
      {/* Help Button */}
      <HelpButton 
        className={instructionsHidden ? "active" : ""}
        onClick={() => setInstructionsHidden(!instructionsHidden)}
      >
        {instructionsHidden ? "!" : "?"}
      </HelpButton>
    </GameSceneContainer>
  );
};
