import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useGameDataRequired, useTurn } from "../shared/providers";
import { usePlayerScene } from "./";
import { getSceneMessage } from "./scene-messages";
import { getDashboardComponent, getBoardComponent } from "./component-mappings";
import { SpectatorBoard } from "../ui-components/boards";
import { GameInstructions } from "../ui-components/game-instructions";
import { ActionButton } from "../shared/components";
import { Z_INDEX } from "@frontend/style/z-index";
import { CodeWordInput } from "../ui-components/dashboards/codemaster-input";
import { useGameActions } from "../player-actions";
import {
  CardVisibilityProvider,
  useCardVisibilityContext,
} from "../ui-components/cards/card-visibility-provider";

const hackerPulse = keyframes`
  0%, 100% {
    border-color: rgba(0, 255, 136, 0.3);
    box-shadow: 
      0 0 10px rgba(0, 255, 136, 0.2),
      inset 0 0 10px rgba(0, 255, 136, 0.05);
  }
  50% {
    border-color: rgba(0, 255, 136, 0.6);
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.4),
      inset 0 0 20px rgba(0, 255, 136, 0.1);
  }
`;

const scanlineAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const glitchAnimation = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 2px var(--color-primary, #00ff88),
      0 0 4px var(--color-primary, #00ff88);
  }
  25% {
    text-shadow: 
      -2px 0 var(--color-accent, #ff0080),
      2px 0 var(--color-team-blue, #00d4ff);
  }
  50% {
    text-shadow: 
      2px 0 var(--color-accent, #ff0080),
      -2px 0 var(--color-primary, #00ff88);
  }
  75% {
    text-shadow: 
      0 0 2px var(--color-team-blue, #00d4ff),
      0 0 4px var(--color-team-blue, #00d4ff);
  }
`;

const instructionsReveal = keyframes`
  /* Hidden phase */
  0% {
    transform: translateY(-120%);
    opacity: 0;
  }
  
  /* Slide in */
  5% {
    transform: translateY(0);
    opacity: 1;
  }
  
  /* Stay visible - wait 3 seconds after typewriter finishes */
  85% {
    transform: translateY(0);
    opacity: 1;
  }
  
  /* Slide out */
  95% {
    transform: translateY(-120%);
    opacity: 0;
  }
  
  /* Stay hidden */
  100% {
    transform: translateY(-120%);
    opacity: 0;
  }
`;

const progressShrink = keyframes`
  0% {
    transform: scaleX(1);
  }
  85% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(0);
  }
`;

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
  /* Mobile-first: Floating help button with hacker aesthetic */
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $isActive }) =>
    $isActive
      ? "linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)"
      : "linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)"};
  border: 2px solid
    ${({ $isActive }) => ($isActive ? "var(--color-primary, #00ff88)" : "rgba(0, 255, 136, 0.3)")};
  color: ${({ $isActive }) => ($isActive ? "var(--color-primary, #00ff88)" : "#fff")};
  font-size: 1.2rem;
  font-weight: bold;
  font-family: "JetBrains Mono", "Courier New", monospace;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: ${Z_INDEX.FIXED_BUTTONS};
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 136, 0.2);
  animation: ${({ $isActive }) => ($isActive ? glitchAnimation : "none")} 2s infinite;

  &:hover {
    transform: scale(1.1) rotate(360deg);
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(0, 255, 136, 0.4);
    animation: ${glitchAnimation} 1s infinite;
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
const InstructionsPanel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(26, 26, 46, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid var(--color-primary, #00ff88);
  z-index: ${Z_INDEX.INSTRUCTIONS_PANEL};
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 255, 136, 0.2);

  /* Initial hidden state */
  transform: translateY(-120%);
  opacity: 0;

  /* Animation triggered by key change */
  animation: ${instructionsReveal} 6s ease-out;
  animation-fill-mode: both;

  padding-top: env(safe-area-inset-top);

  /* Terminal effect */
  &::after {
    content: "MISSION UPDATE";
    position: absolute;
    top: max(env(safe-area-inset-top), 1rem);
    left: 1rem;
    font-size: 0.7rem;
    color: var(--color-primary, #00ff88);
    opacity: 0.5;
    letter-spacing: 0.2em;
    font-family: "JetBrains Mono", monospace;
  }

  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

const PanelContent = styled.div`
  padding: 2rem 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.4;
  color: white;

  /* Add max-width for readability */
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;

  /* Fade in animation */
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: max(env(safe-area-inset-top), 1rem);
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
  border: 2px solid var(--color-primary, #00ff88);
  color: var(--color-primary, #00ff88);
  font-size: 1.2rem;
  font-family: "JetBrains Mono", "Courier New", monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow:
    0 0 10px rgba(0, 255, 136, 0.3),
    inset 0 0 10px rgba(0, 255, 136, 0.05);

  &:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
    transform: scale(1.1) rotate(90deg);
    box-shadow:
      0 0 20px rgba(0, 255, 136, 0.5),
      inset 0 0 20px rgba(0, 255, 136, 0.1);
    animation: ${glitchAnimation} 1s infinite;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--color-primary, #00ff88);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
  width: 100%;
  transform-origin: left;

  /* Shrink animation synced with panel */
  animation: ${progressShrink} 5.1s linear 0.3s; /* Delay to start when panel is visible */
  animation-fill-mode: both;
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
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%);
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
  background: transparent;
  border: 1px solid var(--color-primary, #00ff88);
  color: var(--color-primary, #00ff88);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  font-family: "JetBrains Mono", monospace;
  font-weight: bold;

  /* Match button glow effects */
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);

  &:hover {
    background: var(--color-primary, #00ff88);
    color: #000;
    transform: scale(1.1) rotate(90deg);
    box-shadow:
      0 0 30px rgba(0, 255, 136, 0.5),
      inset 0 0 20px rgba(0, 255, 136, 0.2);
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
    content: "CLASSIFIED";
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
 * MOBILE-FIRST: Dashboard with fixed positioning approach / Terminal styling for desktop
 */
const DashboardContainer = styled.div<{ $role?: string; $arActive?: boolean }>`
  /* Mobile styles - fixed dashboard at bottom */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.98) 100%);
  border-top: 2px solid var(--color-primary, #00ff88);
  border-radius: 16px 16px 0 0;
  z-index: ${Z_INDEX.DASHBOARD};
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  animation: ${hackerPulse} 3s ease-in-out infinite;

  /* Scanline effect for mobile */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 255, 136, 0.8) 50%,
      transparent 100%
    );
    animation: ${scanlineAnimation} 4s linear infinite;
    pointer-events: none;
  }

  /* Desktop terminal styling */
  @media (min-width: 769px) and (orientation: landscape) {
    /* Terminal window styling */
    position: relative;
    bottom: auto;
    height: 100%;
    background: #000000;
    border: 2px solid var(--color-primary, #00ff88);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    font-family: "JetBrains Mono", monospace;
    overflow: hidden;
    box-shadow:
      0 0 20px rgba(0, 255, 136, 0.3),
      inset 0 0 20px rgba(0, 255, 136, 0.05);

    /* Add subtle glow when AR is active */
    ${(props) =>
      props.$arActive &&
      `
      box-shadow: 
        0 0 30px rgba(0, 255, 136, 0.4),
        inset 0 0 20px rgba(0, 255, 136, 0.05);
    `}

    /* Terminal header bar */
    &::before {
      content: "${(props) => {
        const role = props.$role?.toUpperCase() || "OPERATIVE";
        return `${role} TERMINAL`;
      }}";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: block;
      padding: 1rem 1.5rem; /* BIGGER padding */
      background: var(--color-primary, #00ff88);
      color: #000;
      font-size: 1.1rem; /* BIGGER text */
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      animation: none;
      position: static;
      height: auto;
    }
  }

  @media (min-width: 1025px) {
    padding: 0; /* Reset padding for terminal styling */
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
 * Desktop Game Scene component that can access card visibility context
 */
const DesktopGameScene: React.FC<{
  isFetching: boolean;
  currentRole: string;
  messageText: string;
  showCluePanel: boolean;
  setShowCluePanel: (show: boolean) => void;
  DashboardComponent: React.ComponentType<any>;
  BoardComponent: React.ComponentType<any>;
}> = ({
  isFetching,
  currentRole,
  messageText,
  showCluePanel,
  setShowCluePanel,
  DashboardComponent,
  BoardComponent,
}) => {
  const { viewMode } = useCardVisibilityContext();
  const isARActive = viewMode === "spymaster";

  return (
    <GameSceneContainer>
      <SidebarContainer>
        <DashboardContainer $role={currentRole} $arActive={isARActive}>
          {isFetching && <RefetchIndicator />}
          <DashboardComponent
            onOpenCluePanel={() => setShowCluePanel(true)}
            messageText={messageText}
          />
        </DashboardContainer>
      </SidebarContainer>

      <GameBoardContainer>
        <BoardComponent />
      </GameBoardContainer>
    </GameSceneContainer>
  );
};

/**
 * Game Scene Component with mobile-first collapsible instructions
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { currentRole, currentScene } = usePlayerScene();
  const [showCluePanel, setShowCluePanel] = useState(false);
  const { giveClue, actionState } = useGameActions();
  // Get current message
  const messageText = getSceneMessage(currentRole, currentScene, gameData, activeTurn);
  const [toggleMessage, setToggleMessage] = useState(false);

  // Show skeleton during initial load
  if (isPending && !gameData) {
    return (
      <GameSceneContainer>
        <GameBoardContainer>
          <SpectatorBoard />
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
          <SpectatorBoard />
        </GameBoardContainer>
        <DashboardContainer>
          <div>Game Completed!</div>
        </DashboardContainer>
      </GameSceneContainer>
    );
  }

  const DashboardComponent = getDashboardComponent(currentRole, currentScene);
  const BoardComponent = getBoardComponent(currentRole, currentScene);

  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

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
      <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
        <DesktopGameScene
          isFetching={isFetching}
          currentRole={currentRole}
          messageText={messageText}
          showCluePanel={showCluePanel}
          setShowCluePanel={setShowCluePanel}
          DashboardComponent={DashboardComponent}
          BoardComponent={BoardComponent}
        />
      </CardVisibilityProvider>
    );
  }

  // Mobile layout - board + dashboard with pure CSS animated instructions
  return (
    <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
      <GameSceneContainer>
        {/* Instructions panel with pure CSS animation */}
        <InstructionsPanel key={`instruction-${messageText}-${toggleMessage}`}>
          <PanelContent>
            {isFetching && <RefetchIndicator />}
            <GameInstructions messageText={messageText} />
          </PanelContent>
          <ProgressBar key={messageText} />
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

        {/* Help button to manually show instructions */}
        <HelpButton $isActive={false} onClick={() => setToggleMessage(!toggleMessage)}>
          ?
        </HelpButton>

        <GameBoardContainer>
          <BoardComponent />
        </GameBoardContainer>

        <DashboardContainer>
          <DashboardComponent onOpenCluePanel={() => setShowCluePanel(true)} />
        </DashboardContainer>
      </GameSceneContainer>
    </CardVisibilityProvider>
  );
};

GameScene.displayName = "GameScene";
