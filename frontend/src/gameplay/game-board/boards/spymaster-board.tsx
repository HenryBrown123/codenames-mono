import { memo, useMemo, useRef, useLayoutEffect } from "react";
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

export const SpymasterBoard = memo<{ scene?: string }>(({ scene }) => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;
  const { viewMode } = useViewMode();

  // Create stable key from card words (sorted for consistency)
  const wordsKey = useMemo(
    () =>
      cards
        .map((c) => c.word)
        .sort()
        .join(","),
    [cards],
  );

  // Track previous words to detect changes
  const prevWordsKey = useRef(wordsKey);

  // Deal animation should trigger when words change
  const dealOnEntry = wordsKey !== prevWordsKey.current && cards.length > 0;

  // Update ref after render (so next render sees current words as "previous")
  useLayoutEffect(() => {
    prevWordsKey.current = wordsKey;
  });

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

      <GameBoardLayout data-ar-mode={viewMode === "spymaster"}>
        {cards.length > 0
          ? cards.map((card, index) => (
              <GameCard
                key={card.word}
                card={card}
                index={index}
                onClick={() => {}}
                clickable={false}
                isCurrentTeam={currentTeamName === card.teamName}
                dealOnEntry={dealOnEntry}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
      </GameBoardLayout>
    </>
  );
});

SpymasterBoard.displayName = "SpymasterBoard";
