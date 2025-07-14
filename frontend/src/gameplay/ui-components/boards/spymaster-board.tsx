import React, { memo } from "react";
import { useGameDataRequired } from "../../shared/providers";
import { GameCard } from "../cards/game-card";
import { CardVisibilityProvider, useCardVisibilityContext } from "../cards/card-visibility-provider";
import { GameBoardLayout } from "./board-layout";
import { EmptyCard } from "./board-styles";
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
 * SpymasterBoard - Board view with spymaster AR overlay and toggle
 * Includes team color reveal functionality
 */
export const SpymasterBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

  if (cards.length === 0) {
    return (
      <CardVisibilityProvider cards={[]} initialState="hidden">
        <SpymasterBoardContent cards={[]} isRoundSetup={isRoundSetup} />
      </CardVisibilityProvider>
    );
  }

  return (
    <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
      <SpymasterBoardContent cards={cards} isRoundSetup={isRoundSetup} />
    </CardVisibilityProvider>
  );
});

const SpymasterBoardContent = memo<{
  cards: any[];
  isRoundSetup: boolean;
}>(({ cards, isRoundSetup }) => {
  const { triggers, viewMode } = useCardVisibilityContext();

  const handleARToggle = () => {
    triggers.toggleSpymasterView();
  };

  return (
    <>
      {/* AR HUD Overlay - Full screen glasses effect */}
      {viewMode === 'spymaster' && (
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

      <GameBoardLayout data-ar-mode={viewMode === 'spymaster'}>
        {cards.length > 0 
          ? cards.map((card, index) => (
              <GameCard
                key={card.word}
                card={card}
                index={index}
                onClick={() => {}}
                clickable={false}
                initialVisibility={isRoundSetup ? "hidden" : "visible"}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => (
              <EmptyCard key={`empty-${i}`} />
            ))
        }
      </GameBoardLayout>

      {/* AR Toggle Button - only show when cards are visible */}
      {!isRoundSetup && (
        <ARToggleButton $arMode={viewMode === 'spymaster'} onClick={handleARToggle}>
          {viewMode === 'spymaster' ? "DISABLE AR" : "ACTIVATE AR"}
        </ARToggleButton>
      )}
    </>
  );
});

SpymasterBoard.displayName = "SpymasterBoard";