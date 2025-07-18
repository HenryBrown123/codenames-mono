import React, { memo } from "react";
import { useGameDataRequired } from "../../shared/providers";
import { GameCard } from "../cards/game-card";
import { useCardVisibilityContext } from "../cards/card-visibility-provider";
import { GameBoardLayout } from "./board-layout";
import { EmptyCard } from "./board-styles";
import {
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

  return <SpymasterBoardContent cards={cards} isRoundSetup={isRoundSetup} />;
});

const SpymasterBoardContent = memo<{
  cards: any[];
  isRoundSetup: boolean;
}>(({ cards, isRoundSetup }) => {
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

      <GameBoardLayout data-ar-mode={viewMode === "spymaster"}>
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
