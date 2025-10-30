import { memo, useRef, useCallback } from "react";
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
    const { viewMode, setViewMode } = useViewMode();

    // Check if cards array reference changed
    const cardsRef = useRef(cards);
    console.log('[SpymasterBoard] Cards changed?', cards !== cardsRef.current, 'Length:', cards.length);
    cardsRef.current = cards;

    // Callback ref to reset viewMode after board renders
    const boardRef = useCallback((node: HTMLDivElement | null) => {
      if (node && viewMode === "dealing") {
        // After the board has rendered with viewMode="dealing",
        // reset it so animations don't repeat
        requestAnimationFrame(() => {
          setViewMode("normal");
        });
      }
    }, [viewMode, setViewMode]);

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

      <GameBoardLayout ref={boardRef} data-ar-mode={viewMode === "spymaster"} tilt={tilt}>
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

SpymasterBoard.displayName = "SpymasterBoard";
