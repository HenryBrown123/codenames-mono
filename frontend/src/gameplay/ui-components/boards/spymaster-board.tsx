import React, { memo } from "react";
import { useGameDataRequired } from "../../shared/providers";
import { GameCard } from "../cards/game-card";
import { useCardVisibilityContext } from "../cards/card-visibility-provider";
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
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

  return <SpymasterBoardContent cards={cards} isRoundSetup={isRoundSetup} tilt={tilt} />;
});

const SpymasterBoardContent = memo<{
  cards: any[];
  isRoundSetup: boolean;
  tilt: number;
}>(({ cards, isRoundSetup, tilt }) => {
  const { viewMode } = useCardVisibilityContext();

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
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
      </GameBoardLayout>

    </>
  );
});

SpymasterBoard.displayName = "SpymasterBoard";
