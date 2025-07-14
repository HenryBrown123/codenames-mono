import React, { memo, useState } from "react";
import styled from "styled-components";
import { useGameDataRequired } from "../../shared/providers";
import { GameCard } from "../cards/game-card";
import {
  CardVisibilityProvider,
  useCardVisibilityContext,
} from "../cards/card-visibility-provider";
import {
  ARToggleButton,
  ARGlassesHUD,
  ARVisor,
  ARGlare,
  ARScanlines,
  ARHUDContent,
  ARHUDTop,
  ARHUDStatus,
  ARHUDLine,
  ARCornerBrackets,
  ARCorner,
  ARCrosshair,
} from "../cards/ar-overlay-components";

/**
 * MOBILE-FIRST: Board wrapper that handles different viewport constraints
 */
const BoardAspectWrapper = styled.div`
  /* Mobile-first: Use available space efficiently */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;

  /* PROGRESSIVE ENHANCEMENT: Tablet - more breathing room */
  @media (min-width: 481px) {
    padding: 0.5rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - maintain aspect ratio */
  @media (min-width: 1025px) {
    max-width: 900px;
    aspect-ratio: 5 / 4;
    padding: 1rem;
  }
`;

/**
 * MOBILE-FIRST: Adaptive grid that works across all screen sizes
 */
const BoardGrid = styled.div`
  /* Mobile-first: Adaptive grid with minimum card sizes - more vertical space */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.75rem;
  width: 100%;
  height: 100%;
  max-height: 100%; /* Use available height */
  overflow-y: auto; /* Scroll if needed */

  /* Ensure minimum touch targets */
  & > * {
    min-height: 60px;
  }

  /* PROGRESSIVE ENHANCEMENT: Small tablet */
  @media (min-width: 481px) {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 1rem;

    & > * {
      min-height: 70px;
    }
  }

  /* PROGRESSIVE ENHANCEMENT: Large tablet */
  @media (min-width: 769px) {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 1.25rem;

    & > * {
      min-height: 80px;
    }
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - return to 5x5 grid */
  @media (min-width: 1025px) {
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 2rem;
    overflow-y: visible;

    & > * {
      min-height: 100px;
    }
  }
`;

/**
 * Mobile-first empty card for loading/skeleton states
 */
const EmptyCard = styled.div`
  background-color: rgba(27, 9, 9, 0.25);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.123);
  min-height: 60px;
  aspect-ratio: 2.4 / 3;

  /* PROGRESSIVE ENHANCEMENT: Tablet */
  @media (min-width: 481px) {
    border-radius: 8px;
    min-height: 70px;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 769px) {
    border-radius: 12px;
    min-height: 80px;
  }

  @media (min-width: 1025px) {
    min-height: 100px;
  }
`;

/**
 * Internal component that uses the card visibility context
 */
const BoardContent = memo<{
  cards: any[];
  isRoundSetup: boolean;
  arMode: boolean;
  onARToggle: () => void;
}>(({ cards, isRoundSetup, arMode, onARToggle }) => {
  const { triggers } = useCardVisibilityContext();

  const handleARToggle = () => {
    triggers.reveal(!arMode);
    onARToggle();
  };

  return (
    <BoardAspectWrapper data-ar-mode={arMode}>
      {/* AR HUD Overlay - Full screen glasses effect */}
      {arMode && (
        <ARGlassesHUD>
          <ARVisor />
          <ARGlare />
          <ARScanlines />

          <ARHUDContent>
            <ARHUDTop>
              <ARHUDStatus>
                <ARHUDLine>SYSTEM: TACTICAL ANALYSIS MODE</ARHUDLine>
                <ARHUDLine>VIEW: SPYMASTER INTEL</ARHUDLine>
                <ARHUDLine $alert>WARNING: CLASSIFIED DATA</ARHUDLine>
              </ARHUDStatus>

              <ARHUDStatus style={{ textAlign: "right" }}>
                <ARHUDLine>SIGNAL: STRONG</ARHUDLine>
                <ARHUDLine>MODE: ACTIVE</ARHUDLine>
                <ARHUDLine>STATUS: OPERATIONAL</ARHUDLine>
              </ARHUDStatus>
            </ARHUDTop>

            <ARCrosshair />

            <ARCornerBrackets>
              <ARCorner $position="tl" />
              <ARCorner $position="tr" />
              <ARCorner $position="bl" />
              <ARCorner $position="br" />
            </ARCornerBrackets>
          </ARHUDContent>
        </ARGlassesHUD>
      )}

      <BoardGrid aria-label="view-only game board" data-ar-mode={arMode}>
        {cards.map((card, index) => (
          <GameCard
            key={card.word}
            card={card}
            index={index}
            onClick={() => {}}
            clickable={false}
            initialVisibility={isRoundSetup ? "hidden" : "visible"}
          />
        ))}
      </BoardGrid>

      {/* AR Toggle Button - only show when cards are visible */}
      {!isRoundSetup && (
        <ARToggleButton $arMode={arMode} onClick={handleARToggle}>
          {arMode ? "DISABLE AR" : "ACTIVATE AR"}
        </ARToggleButton>
      )}
    </BoardAspectWrapper>
  );
});

/**
 * View-only board - general purpose viewing board
 * Mobile-first responsive design with adaptive grid
 * Includes AR mode toggle for spymaster view
 */
export const ViewOnlyBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

  // AR mode state - local to this board component
  const [arMode, setArMode] = useState(false);

  if (cards.length === 0) {
    return (
      <BoardAspectWrapper>
        <BoardGrid aria-label="view-only game board" data-ar-mode={arMode}>
          {Array.from({ length: 25 }).map((_, i) => (
            <EmptyCard key={`empty-${i}`} />
          ))}
        </BoardGrid>

        {/* AR Toggle Button - only show for spymaster view when cards visible */}
        <ARToggleButton $arMode={arMode} onClick={() => setArMode(!arMode)}>
          {arMode ? "DISABLE AR" : "ACTIVATE AR"}
        </ARToggleButton>
      </BoardAspectWrapper>
    );
  }

  return (
    <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
      <BoardContent
        cards={cards}
        isRoundSetup={isRoundSetup}
        arMode={arMode}
        onARToggle={() => setArMode(!arMode)}
      />
    </CardVisibilityProvider>
  );
});

ViewOnlyBoard.displayName = "ViewOnlyBoard";
