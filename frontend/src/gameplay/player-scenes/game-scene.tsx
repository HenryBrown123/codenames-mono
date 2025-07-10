import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useGameDataRequired, useTurn } from "../shared/providers";
import { usePlayerScene } from "./";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { ViewOnlyBoard } from "../ui-components/boards";
import { GameInstructions } from "../ui-components/game-instructions";
import { ActionButton } from "../shared/components";

/**
 * MOBILE-FIRST: Game scene with collapsible instructions
 */
const GameSceneContainer = styled.div`
  /* Mobile-first: Tighter layout to fit everything */
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;

  display: flex;
  flex-direction: column;
  gap: 0.3rem; /* Smaller gap */
  padding: 0.3rem; /* Smaller padding */
  padding-bottom: 0.5rem; /* Small bottom padding */
  box-sizing: border-box;
  position: relative;

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - sidebar layout */
  @media (min-width: 769px) and (orientation: landscape) {
    grid-template-columns: minmax(250px, 1fr) 2.5fr;
    grid-template-rows: auto 1fr;
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - full sidebar */
  @media (min-width: 1025px) {
    grid-template-columns: minmax(300px, 1.2fr) 3fr;
    grid-template-rows: auto 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

/**
 * MOBILE: Floating help button
 */
const HelpButton = styled.button<{ $isActive: boolean }>`
  /* Mobile-first: Floating help button */
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $isActive }) =>
    $isActive ? "rgba(0, 255, 136, 0.9)" : "rgba(65, 63, 63, 0.9)"};
  border: 2px solid ${({ $isActive }) => ($isActive ? "#00ff88" : "rgba(255, 255, 255, 0.3)")};
  color: ${({ $isActive }) => ($isActive ? "#000" : "#fff")};
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  /* PROGRESSIVE ENHANCEMENT: Hide on desktop/tablet landscape */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

/**
 * MOBILE: Slide-down instructions panel
 */
const InstructionsPanel = styled.div<{ $isVisible: boolean }>`
  /* Mobile-first: Slide-down panel from top */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(65, 63, 63, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 998;

  /* Slide animation */
  transform: translateY(${({ $isVisible }) => ($isVisible ? "0" : "-100%")});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Account for safe areas */
  padding-top: max(env(safe-area-inset-top), 1rem);

  /* PROGRESSIVE ENHANCEMENT: Hide on desktop/tablet landscape */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

const PanelContent = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.4;
  color: white;

  /* Make room for close button */
  margin-top: 2rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

/**
 * MOBILE: Panel backdrop for better UX
 */
const PanelBackdrop = styled.div<{ $isVisible: boolean }>`
  /* Mobile-first: Backdrop overlay */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 997;

  /* Fade animation */
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: ${({ $isVisible }) => ($isVisible ? "all" : "none")};
  transition: opacity 0.3s ease;

  /* PROGRESSIVE ENHANCEMENT: Hide on desktop/tablet landscape */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

/**
 * DESKTOP: Fixed instructions for larger screens
 */
const DesktopInstructionsContainer = styled.div`
  /* Hidden on mobile - instructions are floating */
  display: none;

  /* PROGRESSIVE ENHANCEMENT: Show on tablet landscape+ */
  @media (min-width: 769px) and (orientation: landscape) {
    display: flex;
    background-color: rgba(65, 63, 63, 0.9);
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.75rem;
    font-size: 0.85rem;
    line-height: 1.3;
    flex-shrink: 0;
    min-height: 50px;
    max-height: 80px;
    overflow: hidden;
    grid-column: 1 / -1;
  }

  @media (min-width: 481px) {
    font-size: 0.95rem;
    padding: 1rem;
    border-radius: 12px;
    max-height: 100px;
  }

  @media (min-width: 1025px) {
    font-size: 1.2rem;
    padding: 1.5rem;
  }
`;

/**
 * MOBILE-FIRST: Sidebar container for larger screens
 */
const SidebarContainer = styled.div`
  /* Hidden on mobile */
  display: none;

  /* PROGRESSIVE ENHANCEMENT: Show on tablet landscape+ */
  @media (min-width: 769px) and (orientation: landscape) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    grid-column: 1;
    grid-row: 2;
  }
`;

/**
 * MOBILE-FIRST: Game board that takes maximum space
 */
const GameBoardContainer = styled.div`
  /* Mobile-first: Board with tighter constraints */
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  min-height: 250px; /* Smaller minimum for mobile */
  max-height: 60vh; /* Constrain height to leave room for dashboard */
  overflow: hidden;

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - grid placement */
  @media (min-width: 769px) and (orientation: landscape) {
    grid-column: 2;
    grid-row: 2;
    padding: 1rem;
  }
`;

/**
 * MOBILE-FIRST: Dashboard that stays accessible
 */
const DashboardContainer = styled.div`
  /* Mobile-first: More compact dashboard */
  background-color: rgba(65, 63, 63, 0.9);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  flex-shrink: 0;
  min-height: 60px;
  max-height: 80px; /* Tighter constraint */

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - full height in sidebar */
  @media (min-width: 769px) and (orientation: landscape) {
    height: 100%;
    max-height: none;
    flex-direction: column;
    border-radius: 16px;
  }

  @media (min-width: 1025px) {
    padding: 1.5rem;
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
 * Game Scene Component with mobile-first collapsible instructions
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene } = usePlayerScene();
  const [showInstructions, setShowInstructions] = useState(false);

  // Show skeleton during initial load
  if (isPending && !gameData) {
    return (
      <GameSceneContainer>
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
  const [isLandscapeTablet, setIsLandscapeTablet] = React.useState(
    window.matchMedia("(min-width: 769px) and (orientation: landscape)").matches,
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 769px) and (orientation: landscape)");
    const handleChange = (e: MediaQueryListEvent) => setIsLandscapeTablet(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isLandscapeTablet) {
    // Sidebar layout for tablet landscape and desktop
    return (
      <GameSceneContainer>
        <DesktopInstructionsContainer>
          {isFetching && <RefetchIndicator />}
          <GameInstructions messageText={messageText} />
        </DesktopInstructionsContainer>

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

  // Mobile layout - board + dashboard with slide-down instructions
  return (
    <GameSceneContainer>
      {/* Mobile slide-down backdrop */}
      <PanelBackdrop $isVisible={showInstructions} onClick={() => setShowInstructions(false)} />

      {/* Mobile slide-down instructions panel */}
      <InstructionsPanel $isVisible={showInstructions}>
        <CloseButton onClick={() => setShowInstructions(false)}>×</CloseButton>
        <PanelContent>
          {isFetching && <RefetchIndicator />}
          <GameInstructions messageText={messageText} />

          {/* TODO: Future expansion area for settings/options */}
          {/* 
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h4>Game Options</h4>
            <button>Settings</button>
            <button>Rules</button>
          </div>
          */}
        </PanelContent>
      </InstructionsPanel>

      {/* Mobile floating help button */}
      <HelpButton
        $isActive={showInstructions}
        onClick={() => setShowInstructions(!showInstructions)}
      >
        {showInstructions ? "?" : "?"}
      </HelpButton>

      <GameBoardContainer>
        <BoardComponent />
      </GameBoardContainer>

      <DashboardContainer>
        <DashboardComponent />
      </DashboardContainer>
    </GameSceneContainer>
  );
};

GameScene.displayName = "GameScene";
