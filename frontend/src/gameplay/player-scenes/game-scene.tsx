import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useGameDataRequired, useTurn } from "../shared/providers";
import { usePlayerScene } from "./";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { ViewOnlyBoard } from "../ui-components/boards";
import { GameInstructions } from "../ui-components/game-instructions";
import { ActionButton } from "../shared/components";
import { Z_INDEX } from "@frontend/style/z-index";
import { CodeWordInput } from "../ui-components/dashboards/codemaster-input";
import { useGameActions } from "../player-actions";

/**
 * MOBILE-FIRST: Game scene with collapsible instructions
 */
const GameSceneContainer = styled.div`
  /* Mobile-first: Simple full-height container */
  width: 100%;
  height: 100vh;
  height: 100dvh;
  height: -webkit-fill-available;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  padding-bottom: 0; /* Let fixed dashboard handle bottom spacing */
  box-sizing: border-box;
  position: relative;

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - return to grid */
  @media (min-width: 769px) and (orientation: landscape) {
    grid-template-columns: minmax(250px, 1fr) 2.5fr;
    grid-template-rows: auto 1fr;
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }

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
    $isActive ? "var(--color-primary, #00ff88)" : "rgba(65, 63, 63, 0.9)"};
  border: 2px solid ${({ $isActive }) => 
    ($isActive ? "var(--color-primary, #00ff88)" : "rgba(255, 255, 255, 0.3)")};
  color: ${({ $isActive }) => ($isActive ? "#000" : "#fff")};
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: ${Z_INDEX.FIXED_BUTTONS};
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
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
  background: linear-gradient(
    180deg,
    rgba(65, 63, 63, 0.98) 0%,
    rgba(65, 63, 63, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: ${Z_INDEX.INSTRUCTIONS_PANEL};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  /* Slide animation */
  transform: translateY(${({ $isVisible }) => ($isVisible ? "0" : "-100%")});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Account for safe areas */
  padding-top: env(safe-area-inset-top);

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
  margin-top: 2.5rem;
  
  /* Add max-width for readability */
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: max(env(safe-area-inset-top), 1rem);
  right: 1rem;
  width: 36px;
  height: 36px;
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
  backdrop-filter: blur(10px);

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
  z-index: ${Z_INDEX.INSTRUCTIONS_BACKDROP};

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
 * MOBILE: Full-screen clue panel - EXACTLY like instructions but MORE
 */
const CluePanel = styled.div<{ $isVisible: boolean }>`
  /* Mobile-first: Full screen takeover from bottom */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 15, 0.98) 0%,
    rgba(26, 26, 46, 0.98) 100%
  );
  backdrop-filter: blur(20px);
  z-index: ${Z_INDEX.MODAL_CONTENT};
  
  /* Slide animation from bottom */
  transform: translateY(${({ $isVisible }) => ($isVisible ? "0" : "100%")});
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);

  /* Safe areas */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);

  /* Layout */
  display: flex;
  flex-direction: column;

  /* PROGRESSIVE ENHANCEMENT: Hide on desktop/tablet landscape */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

const CluePanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem 1rem 1rem;
`;

const HackerTitle = styled.h1`
  color: var(--color-primary, #00ff88);
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0;
  text-shadow: 
    0 0 20px rgba(0, 255, 136, 0.5),
    0 0 40px rgba(0, 255, 136, 0.3);
    
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const CluePanelContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  
  /* Max width for readability */
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const ClueCloseButton = styled.button`
  position: absolute;
  top: max(env(safe-area-inset-top), 2rem);
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-primary, #00ff88);
  color: var(--color-primary, #00ff88);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(0, 255, 136, 0.1);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const HackerDecoration = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300%;
  height: 300%;
  opacity: 0.03;
  pointer-events: none;
  font-size: 20vw;
  font-weight: 900;
  color: var(--color-primary, #00ff88);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &::before {
    content: 'CLASSIFIED';
    transform: rotate(-45deg);
  }
`;

/**
 * MOBILE: Clue panel backdrop
 */
const CluePanelBackdrop = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: ${Z_INDEX.MODAL_BACKDROP};

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
  /* Mobile-first: Account for fixed dashboard at bottom */
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  min-height: 300px;
  overflow: hidden;

  /* Critical: Add bottom padding to prevent overlap with fixed dashboard */
  padding-bottom: calc(80px + 0.5rem); /* Dashboard height + gap */

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - remove bottom padding */
  @media (min-width: 769px) and (orientation: landscape) {
    grid-column: 2;
    grid-row: 2;
    padding: 1rem;
    padding-bottom: 1rem; /* Reset to normal */
  }
`;

/**
 * MOBILE-FIRST: Dashboard with fixed positioning approach
 */
const DashboardContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  
  height: 80px;
  background-color: rgba(65, 63, 63, 0.9);
  border-radius: 8px 8px 0 0;
  z-index: ${Z_INDEX.DASHBOARD};
  
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.75rem;
  
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (min-width: 769px) and (orientation: landscape) {
    position: relative;
    bottom: auto;
    height: 100%;
    max-height: none;
    flex-direction: column;
    border-radius: 16px;
    z-index: auto;
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
  const [showCluePanel, setShowCluePanel] = useState(false);
  const { giveClue, actionState } = useGameActions();

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

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowCluePanel(false);
  };

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
            <DashboardComponent onOpenCluePanel={() => setShowCluePanel(true)} />
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

      {/* MOBILE CLUE PANEL - FULL SCREEN TAKEOVER */}
      <CluePanelBackdrop $isVisible={showCluePanel} onClick={() => setShowCluePanel(false)} />
      
      <CluePanel $isVisible={showCluePanel}>
        <HackerDecoration />
        
        <CluePanelHeader>
          <ClueCloseButton onClick={() => setShowCluePanel(false)}>×</ClueCloseButton>
          <HackerTitle>TRANSMIT CLUE</HackerTitle>
        </CluePanelHeader>
        
        <CluePanelContent>
          <CodeWordInput
            codeWord=""
            numberOfCards={null}
            isEditable={true}
            isLoading={actionState.status === "loading"}
            onSubmit={handleSubmitClue}
          />
        </CluePanelContent>
      </CluePanel>

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
        <DashboardComponent onOpenCluePanel={() => setShowCluePanel(true)} />
      </DashboardContainer>
    </GameSceneContainer>
  );
};

GameScene.displayName = "GameScene";
