import React, { memo, useCallback, useMemo } from "react";
import { useGameDataRequired, useTurn } from "../../shared/providers";
import { useGameActions } from "../../player-actions";
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
 * Internal component that uses the card visibility context
 */
const CodebreakerBoardContent = memo<{
  cards: any[];
  canMakeGuess: boolean;
  isLoading: boolean;
  activeTurn: any;
  onCardClick: (word: string) => void;
}>(({ cards, canMakeGuess, isLoading, activeTurn, onCardClick }) => {
  const { viewMode } = useCardVisibilityContext();

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
                <ARHUDLine>SYSTEM: OPERATIVE MODE</ARHUDLine>
                <ARHUDLine>ROLE: FIELD AGENT</ARHUDLine>
                <ARHUDLine>STATUS: MISSION ACTIVE</ARHUDLine>
              </ARHUDStatus>

              <ARHUDStatus style={{ textAlign: "right" }}>
                <ARHUDLine>GUESSES: {activeTurn?.guessesRemaining || 0}</ARHUDLine>
                <ARHUDLine>CLUE: {activeTurn?.clue?.word || "WAITING"}</ARHUDLine>
                <ARHUDLine>TARGET: {activeTurn?.clue?.count || 0}</ARHUDLine>
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
        {cards.length > 0 ? cards.map((card, index) => (
          <GameCard
            key={card.word}
            card={card}
            index={index}
            onClick={() => onCardClick(card.word)}
            clickable={canMakeGuess && !isLoading && !card.selected}
          />
        )) : Array.from({ length: 25 }).map((_, i) => (
          <EmptyCard key={`empty-${i}`} />
        ))}
      </GameBoardLayout>

    </>
  );
});

/**
 * CodebreakerBoard - Interactive board for making guesses during active play
 * Mobile-first responsive design with adaptive grid
 * Includes AR mode toggle for enhanced gameplay
 */
export const CodebreakerBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const { makeGuess, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const cards = gameData.currentRound?.cards || [];

  const isLoading = actionState.status === "loading";

  /**
   * Determine if the current player can make guesses
   */
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
    />
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";
