import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { GameCard } from "../cards/game-card";
import { useViewMode } from "../view-mode/view-mode-context";
import { GameBoardLayout, EmptyCard } from "./board-layout";
import {
  ARGlassesHUD,
  ARVisor,
  ARGlare,
  ARScanlines,
  ARHUDContent,
  ARHUDTop,
  ARHUDStatus,
  ARHUDLine,
} from "../cards/ar-overlay-components";

const CodebreakerBoardContent = memo<{
  cards: any[];
  canMakeGuess: boolean;
  isLoading: boolean;
  activeTurn: any;
  onCardClick: (word: string) => void;
  tilt: number;
  currentTeamName?: string;
  dealKey: number;
  dealOnEntry: boolean;
}>(({ cards, canMakeGuess, isLoading, activeTurn, onCardClick, tilt, currentTeamName, dealKey, dealOnEntry }) => {
  const { viewMode } = useViewMode();

  return (
    <>
      {viewMode === "spymaster" && (
        <ARGlassesHUD>
          <ARVisor />
          <ARGlare />
          <ARScanlines />

          <ARHUDContent>
            <ARHUDTop>
              <ARHUDStatus>
                <ARHUDLine>SYSTEM: OPERATIVE MODE</ARHUDLine>
                <ARHUDLine>ROLE: FIELD AGENT</ARHUDLine>
                <ARHUDLine>STATUS: MISSION ACTIVE</ARHUDLine>
              </ARHUDStatus>

              <ARHUDStatus>
                <ARHUDLine>GUESSES: {activeTurn?.guessesRemaining || 0}</ARHUDLine>
                <ARHUDLine>CLUE: {activeTurn?.clue?.word || "WAITING"}</ARHUDLine>
                <ARHUDLine>TARGET: {activeTurn?.clue?.count || 0}</ARHUDLine>
              </ARHUDStatus>
            </ARHUDTop>
          </ARHUDContent>
        </ARGlassesHUD>
      )}

      <GameBoardLayout data-ar-mode={viewMode === "spymaster"} tilt={tilt}>
        {cards.length > 0
          ? cards.map((card, index) => (
              <GameCard
                key={`${dealKey}-${card.word}`}
                card={card}
                index={index}
                onClick={() => onCardClick(card.word)}
                clickable={canMakeGuess && !isLoading && !card.selected}
                isCurrentTeam={currentTeamName === card.teamName}
                dealOnEntry={dealOnEntry}
              />
            ))
          : Array.from({ length: 25 }).map((_, i) => <EmptyCard key={`empty-${i}`} />)}
      </GameBoardLayout>
    </>
  );
});

CodebreakerBoardContent.displayName = "CodebreakerBoardContent";

export const CodebreakerBoard = memo<{ tilt?: number }>(({ tilt = 0 }) => {
  const { gameData } = useGameDataRequired();
  const { makeGuess, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const cards = gameData.currentRound?.cards || [];
  const currentTeamName = gameData.playerContext?.teamName;

  const isLoading = actionState.status === "loading";

  const [dealKey, setDealKey] = useState(0);
  const [dealOnEntry, setDealOnEntry] = useState(true);

  // When new round starts, force remount to retrigger deal animations
  useEffect(() => {
    if (cards.length > 0) {
      setDealKey((prev) => prev + 1);
      setDealOnEntry(true);

      // Reset dealOnEntry after animations complete
      // Calculation: stagger (50ms) * card count + animation duration (800ms) + buffer (200ms)
      const timer = setTimeout(() => {
        setDealOnEntry(false);
      }, cards.length * 50 + 1000);

      return () => clearTimeout(timer);
    }
  }, [gameData.currentRound?.roundNumber, cards.length]);

  const canMakeGuess = useMemo(() => {
    if (gameData.playerContext?.role !== "CODEBREAKER") return false;
    if (!activeTurn || activeTurn.status !== "ACTIVE") return false;
    if (activeTurn.teamName !== gameData.playerContext.teamName) return false;
    if (!activeTurn.clue) return false;
    if (activeTurn.guessesRemaining <= 0) return false;

    return true;
  }, [gameData.playerContext, activeTurn]);

  const handleCardClick = useCallback(
    (word: string) => {
      if (!isLoading && canMakeGuess) {
        makeGuess(word);
      }
    },
    [makeGuess, isLoading, canMakeGuess],
  );

  return (
    <CodebreakerBoardContent
      cards={cards}
      canMakeGuess={canMakeGuess}
      isLoading={isLoading}
      activeTurn={activeTurn}
      onCardClick={handleCardClick}
      tilt={tilt}
      currentTeamName={currentTeamName}
      dealKey={dealKey}
      dealOnEntry={dealOnEntry}
    />
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";
