import { memo } from "react";
import { useGameDataRequired } from "../../game-data/providers";
import { GameCard } from "../cards/game-card";
import { useViewMode } from "../view-mode/view-mode-context";
import { GameBoardLayout, EmptyCard } from "./board-layout";
import {
  ARGlassesHUD,
  ARVisor,
  ARGlare,
  ARScanlines,
  ARHUDContent,
} from "../cards/ar-overlay-components";

export const SpymasterBoard = memo<{ tilt?: number; scene?: string }>(
  ({ tilt = 0, scene }) => {
    const { gameData } = useGameDataRequired();
    const cards = gameData.currentRound?.cards || [];
    const currentTeamName = gameData.playerContext?.teamName;
    const { viewMode } = useViewMode();

    // Animation only plays in lobby/dealing scenes
    const shouldAnimateDeal = scene === "lobby" || scene === "dealing";

  return (
    <>
      {viewMode === "spymaster" && (
        <ARGlassesHUD>
          <ARVisor />
          <ARGlare />
          <ARScanlines />
          <ARHUDContent />
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
                dealOnEntry={shouldAnimateDeal}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
      </GameBoardLayout>
    </>
  );
});

SpymasterBoard.displayName = "SpymasterBoard";
