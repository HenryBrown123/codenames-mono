import React, { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GameCard } from "../gameplay/game-board/cards/game-card";
import { CardVisibilityManager } from "../gameplay/game-board/cards/card-visibility-manager";
import { useCardVisibilityStore } from "../gameplay/game-board/cards/card-visibility-store";
import { GameBoardLayout } from "../gameplay/game-board/boards/board-layout";
import { Card, GameData } from "@frontend/shared-types";

// Define PlayerContext locally since it might not be exported
interface PlayerContext {
  playerName: string;
  teamName: string;
  role: "CODEMASTER" | "CODEBREAKER";
}
import styles from "./sandbox.module.css";

// Mock cards
const MOCK_CARDS: Card[] = [
  { word: "AGENT", teamName: "red", selected: false, cardType: "word" },
  { word: "SPY", teamName: "blue", selected: false, cardType: "word" },
  { word: "CODE", teamName: "neutral", selected: false, cardType: "word" },
  { word: "SECRET", teamName: "red", selected: false, cardType: "word" },
  { word: "MISSION", teamName: "blue", selected: false, cardType: "word" },
  { word: "TARGET", teamName: "neutral", selected: false, cardType: "word" },
  { word: "SHADOW", teamName: "red", selected: false, cardType: "word" },
  { word: "CIPHER", teamName: "blue", selected: false, cardType: "word" },
  { word: "INTEL", teamName: "neutral", selected: false, cardType: "word" },
];

// Mock players
const PLAYERS = {
  redCodemaster: { playerName: "Red Master", teamName: "red", role: "CODEMASTER" as const },
  redCodebreaker: { playerName: "Red Breaker", teamName: "red", role: "CODEBREAKER" as const },
  blueCodemaster: { playerName: "Blue Master", teamName: "blue", role: "CODEMASTER" as const },
  blueCodebreaker: { playerName: "Blue Breaker", teamName: "blue", role: "CODEBREAKER" as const },
};

// Mock mutation hooks that trigger the same way as real ones
const useMockGiveClue = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (word: string, count: number) => {
      console.log("🎯 Mutation: giveClue", { word, count });

      // Simulate the onSuccess from real mutation
      const currentData = queryClient.getQueryData<any>(["game", "sandbox"]);
      const updatedData = {
        ...currentData,
        currentRound: {
          ...currentData.currentRound,
          activeTurn: {
            clue: { word, count },
            guessesRemaining: count + 1,
          },
        },
      };

      queryClient.setQueryData(["game", "sandbox"], updatedData);

      // Trigger the same actions your real mutation would
      console.log("✅ Clue given, triggering handoff...");
      return updatedData;
    },
    [queryClient],
  );
};

const useMockMakeGuess = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (word: string) => {
      console.log("🎯 Mutation: makeGuess", { word });

      const currentData = queryClient.getQueryData<any>(["game", "sandbox"]);
      const cards = currentData.currentRound.cards;
      const guessedCard = cards.find((c: Card) => c.word === word);

      // Update cards with selection
      const updatedCards = cards.map((c: Card) => (c.word === word ? { ...c, selected: true } : c));

      const isCorrectTeam = guessedCard?.teamName === currentData.playerContext?.teamName;
      const remaining = (currentData.currentRound.activeTurn?.guessesRemaining || 1) - 1;

      const updatedData = {
        ...currentData,
        currentRound: {
          ...currentData.currentRound,
          cards: updatedCards,
          activeTurn: {
            ...currentData.currentRound.activeTurn,
            guessesRemaining: remaining,
            lastGuess: {
              word,
              outcome: isCorrectTeam ? "CORRECT_TEAM_CARD" : "OTHER_TEAM_CARD",
            },
          },
        },
      };

      queryClient.setQueryData(["game", "sandbox"], updatedData);

      // Trigger the same card processing your real mutation would
      console.log("✅ Cards updated after guess");

      return updatedData;
    },
    [queryClient],
  );
};

// Handoff overlay mimicking real one
const HandoffOverlay: React.FC<{
  onSelectPlayer: (player: PlayerContext) => void;
}> = ({ onSelectPlayer }) => {
  return (
    <div className={styles.handoffOverlay}>
      <h2>Pass the device</h2>
      <div className={styles.playerList}>
        {Object.entries(PLAYERS).map(([key, player]) => (
          <button key={key} className={styles.playerButton} onClick={() => onSelectPlayer(player)}>
            <div className={styles.playerRole}>{player.role}</div>
            <div className={styles.playerName}>{player.playerName}</div>
            <div className={styles.playerTeam}>{player.teamName}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Clue input mimicking real one
const ClueInput: React.FC<{
  onSubmit: (word: string, count: number) => void;
}> = ({ onSubmit }) => {
  const [word, setWord] = useState("");
  const [count, setCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim()) {
      onSubmit(word, count);
      setWord("");
      setCount(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.clueForm}>
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter clue word"
      />
      <input
        type="number"
        value={count}
        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
        min={1}
        max={9}
      />
      <button type="submit">Give Clue</button>
    </form>
  );
};

// Main sandbox
export const GameFlowSandbox: React.FC = () => {
  const queryClient = useQueryClient();
  const [playerContext, setPlayerContext] = useState<PlayerContext | null>(null);
  const [requiresHandoff, setRequiresHandoff] = useState(true);
  const [cards, setCards] = useState(MOCK_CARDS);
  const [activeTurn, setActiveTurn] = useState<any>(null);

  const giveClue = useMockGiveClue();
  const makeGuess = useMockMakeGuess();

  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const toggleSpymasterView = useCardVisibilityStore((state) => state.toggleSpymasterView);

  React.useEffect(() => {
    const gameData: Partial<GameData> = {
      publicId: "sandbox",
      status: "IN_PROGRESS",
      gameType: "SINGLE_DEVICE",
      gameFormat: "QUICK",
      createdAt: new Date(),
      teams: [
        {
          name: "red",
          score: 0,
          players: [{ publicId: "red-1", name: "Red Player", isActive: true }],
        },
        {
          name: "blue",
          score: 0,
          players: [{ publicId: "blue-1", name: "Blue Player", isActive: true }],
        },
      ],
      currentRound: {
        _id: "round-1",
        cards: cards,
        status: "ACTIVE",
        activeTurn: activeTurn,
      } as any,
      playerContext: playerContext as any,
    };

    queryClient.setQueryData(["game", "sandbox"], gameData);
  }, [cards, playerContext, activeTurn, queryClient]);

  // Handle player selection (same as real handoff)
  const handleSelectPlayer = (player: PlayerContext) => {
    console.log("👤 Player selected:", player);
    setPlayerContext(player);
    setRequiresHandoff(false);
  };

  // Handle clue submission (triggers handoff like real game)
  const handleGiveClue = (word: string, count: number) => {
    const result = giveClue(word, count);
    setActiveTurn(result.currentRound.activeTurn);

    // Trigger handoff after clue (same as real game)
    setPlayerContext(null);
    setRequiresHandoff(true);
  };

  // Handle card guess
  const handleCardClick = (word: string) => {
    if (playerContext?.role !== "CODEBREAKER") {
      console.log("Not a codebreaker, ignoring click");
      return;
    }

    const result = makeGuess(word);
    setCards(result.currentRound.cards);
    setActiveTurn(result.currentRound.activeTurn);

    // Check if turn should end
    if (
      result.currentRound.activeTurn.guessesRemaining === 0 ||
      result.currentRound.activeTurn.lastGuess?.outcome !== "CORRECT_TEAM_CARD"
    ) {
      console.log("Turn ended, triggering handoff...");
      setTimeout(() => {
        setPlayerContext(null);
        setRequiresHandoff(true);
      }, 1500);
    }
  };

  // Get current scene based on player and game state
  const getCurrentScene = () => {
    if (!playerContext) return "handoff";
    if (playerContext.role === "CODEMASTER" && !activeTurn?.clue) return "codemaster-main";
    if (playerContext.role === "CODEMASTER" && activeTurn?.clue) return "codemaster-waiting";
    if (playerContext.role === "CODEBREAKER" && !activeTurn?.clue) return "codebreaker-waiting";
    if (playerContext.role === "CODEBREAKER" && activeTurn?.clue) return "codebreaker-main";
    return "unknown";
  };

  const scene = getCurrentScene();

  return (
    <div className={styles.sandbox}>
      <h1>Game Flow Sandbox</h1>

      <div className={styles.statusBar}>
        <div>
          Scene: <strong>{scene}</strong>
        </div>
        <div>
          Player: <strong>{playerContext?.playerName || "None"}</strong>
        </div>
        <div>
          Role: <strong>{playerContext?.role || "None"}</strong>
        </div>
        <div>
          Team: <strong>{playerContext?.teamName || "None"}</strong>
        </div>
        {activeTurn?.clue && (
          <div>
            Clue:{" "}
            <strong>
              {activeTurn.clue.word} ({activeTurn.clue.count})
            </strong>
          </div>
        )}
        {activeTurn?.guessesRemaining !== undefined && (
          <div>
            Guesses Left: <strong>{activeTurn.guessesRemaining}</strong>
          </div>
        )}
      </div>

      {/* Handoff overlay - same trigger as real game */}
      {requiresHandoff && <HandoffOverlay onSelectPlayer={handleSelectPlayer} />}

      {/* Game content */}
      {!requiresHandoff && (
        <>
          {/* Codemaster clue input */}
          {scene === "codemaster-main" && (
            <div className={styles.clueSection}>
              <h3>Give your team a clue:</h3>
              <ClueInput onSubmit={handleGiveClue} />
            </div>
          )}

          {/* AR toggle for codemasters */}
          {playerContext?.role === "CODEMASTER" && (
            <div className={styles.controls}>
              <button
                className={viewMode === "spymaster" ? styles.active : ""}
                onClick={toggleSpymasterView}
              >
                {viewMode === "spymaster" ? "🔍 Hide" : "👁️ Reveal"} Team Colors
              </button>
            </div>
          )}

          {/* Game board */}
          <div className={styles.boardContainer}>
            <CardVisibilityManager cards={cards} initialState="visible" />
            <GameBoardLayout tilt={0}>
              {cards.map((card, index) => (
                <GameCard
                  key={card.word}
                  card={card}
                  index={index}
                  onClick={() => handleCardClick(card.word)}
                  clickable={
                    playerContext?.role === "CODEBREAKER" &&
                    !card.selected &&
                    activeTurn?.guessesRemaining > 0
                  }
                  isCurrentTeam={card.teamName === playerContext?.teamName}
                />
              ))}
            </GameBoardLayout>
          </div>

          {/* Turn info for codebreakers */}
          {scene === "codebreaker-main" && activeTurn?.lastGuess && (
            <div className={styles.turnInfo}>
              Last guess: <strong>{activeTurn.lastGuess.word}</strong> -
              {activeTurn.lastGuess.outcome === "CORRECT_TEAM_CARD"
                ? "✅ Correct!"
                : "❌ Wrong team!"}
            </div>
          )}
        </>
      )}

      <div className={styles.stateDebug}>
        <h3>Debug State</h3>
        <pre>
          {JSON.stringify(
            {
              scene,
              playerContext,
              requiresHandoff,
              activeTurn,
              viewMode,
              selectedCards: cards.filter((c) => c.selected).map((c) => c.word),
            },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
};
