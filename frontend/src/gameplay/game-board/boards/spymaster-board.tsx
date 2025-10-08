import React, { memo, useEffect } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { useCardVisibilityStore } from "../cards/card-visibility-store";
import { useAnimationEngine } from "../../animations/animation-engine-context";
import { GameBoardLayout } from "./board-layout";
import { EmptyCard } from "./board-layout";
import {
  ARGlassesHUD,
  ARVisor,
  ARGlare,
  ARScanlines,
  ARHUDContent,
} from "../cards/ar-overlay-components";

/**
 * SpymasterBoard - Board view with spymaster AR overlay and toggle
 * Includes team color reveal functionality
 */
export const SpymasterBoard = memo<{ tilt?: number }>(({ tilt = 0 }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const dealCardsFromStore = useCardVisibilityStore((state) => state.dealCards);
  const animationEngine = useAnimationEngine();

  return <SpymasterBoardContent cards={cards} tilt={tilt} currentTeamName={currentTeamName} />;
});

const SpymasterBoardContent = memo<{
  cards: any[];
  tilt: number;
  currentTeamName?: string;
}>(({ cards, tilt, currentTeamName }) => {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);

  return (
    <>
      {/* AR HUD Overlay - Full screen glasses effect */}
      {viewMode === "spymaster" && (
        <ARGlassesHUD>
          <ARVisor />
          <ARGlare />
          <ARScanlines />

          <ARHUDContent>
            {/* Removed screen-level crosshair and corners - keeping card-level ones */}
          </ARHUDContent>
        </ARGlassesHUD>
      )}

      <GameBoardLayout data-ar-mode={viewMode === "spymaster"} tilt={tilt}>
        {cards.length > 0
          ? cards.map((card, index) => (
              <GameCard
                key={card.word}
                card={card}
                index={index}
                onClick={() => {}}
                clickable={false}
                isCurrentTeam={currentTeamName === card.teamName}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
      </GameBoardLayout>
    </>
  );
});

SpymasterBoardContent.displayName = "SpymasterBoardContent";
SpymasterBoard.displayName = "SpymasterBoard";
