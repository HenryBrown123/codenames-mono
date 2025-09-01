import React, { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GameCard } from "../gameplay/game-board/cards/game-card";
import { useCardVisibilityStore } from "../gameplay/game-board/cards/card-visibility-store";
import { useCardVisibility } from "../gameplay/game-board/cards/use-card-visibility";
import { GameBoardLayout } from "../gameplay/game-board/boards/board-layout";
import { Card, GameData } from "@frontend/shared-types";
import { CARD_TRANSITIONS } from "../gameplay/game-board/cards/card-visibility-provider";
import type {
  VisualState,
  CardVisibilityData,
} from "../gameplay/game-board/cards/card-visibility-provider";
import styles from "./sandbox.module.css";

// Define PlayerContext locally since it might not be exported
interface PlayerContext {
  playerName: string;
  teamName: string;
  role: "CODEMASTER" | "CODEBREAKER";
}

// Pure function for processing card visibility
const processCardTransitions = (
  cards: Card[],
  currentCardData: Map<string, CardVisibilityData>,
  viewMode: "player" | "spymaster",
  initialState: VisualState = "visible",
): Map<string, CardVisibilityData> => {
  let updatedData: Map<string, CardVisibilityData> | null = null;
  let hasChanges = false;

  cards.forEach((card) => {
    const currentData = currentCardData.get(card.word);

    if (!currentData) {
      // New card, initialize it
      if (!updatedData) updatedData = new Map(currentCardData);
      const newState = card.selected ? "visible-covered" : initialState;
      updatedData.set(card.word, {
        state: newState,
        animation: initialState === "hidden" ? "deal-in" : null,
      });
      hasChanges = true;
      return;
    }

    // Find applicable transition
    const transition = CARD_TRANSITIONS.find(
      (t) => t.from === currentData.state && t.condition(card, viewMode),
    );

    if (transition && currentData.state !== transition.to) {
      if (!updatedData) updatedData = new Map(currentCardData);
      updatedData.set(card.word, {
        state: transition.to,
        animation: transition.animation,
      });
      hasChanges = true;
    }
  });

  // Return the same map instance if nothing changed
  return hasChanges && updatedData ? updatedData : currentCardData;
};

// Extend cards to have 25 cards (5x5 grid)
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
  { word: "DECODE", teamName: "red", selected: false, cardType: "word" },
  { word: "ENCRYPT", teamName: "blue", selected: false, cardType: "word" },
  { word: "NETWORK", teamName: "neutral", selected: false, cardType: "word" },
  { word: "COVERT", teamName: "red", selected: false, cardType: "word" },
  { word: "STEALTH", teamName: "blue", selected: false, cardType: "word" },
  { word: "SECURE", teamName: "neutral", selected: false, cardType: "word" },
  { word: "BREACH", teamName: "red", selected: false, cardType: "word" },
  { word: "PROTOCOL", teamName: "blue", selected: false, cardType: "word" },
  { word: "SYSTEM", teamName: "neutral", selected: false, cardType: "word" },
  { word: "ACCESS", teamName: "red", selected: false, cardType: "word" },
  { word: "FIREWALL", teamName: "blue", selected: false, cardType: "word" },
  { word: "DATABASE", teamName: "neutral", selected: false, cardType: "word" },
  { word: "TERMINAL", teamName: "red", selected: false, cardType: "word" },
  { word: "MAINFRAME", teamName: "blue", selected: false, cardType: "word" },
  { word: "SERVER", teamName: "neutral", selected: false, cardType: "word" },
  { word: "ASSASSIN", teamName: "black", selected: false, cardType: "assassin" },
];

// Mock players
const PLAYERS = {
  redCodemaster: { playerName: "Red Master", teamName: "red", role: "CODEMASTER" as const },
  redCodebreaker: { playerName: "Red Breaker", teamName: "red", role: "CODEBREAKER" as const },
  blueCodemaster: { playerName: "Blue Master", teamName: "blue", role: "CODEMASTER" as const },
  blueCodebreaker: { playerName: "Blue Breaker", teamName: "blue", role: "CODEBREAKER" as const },
};

// Mock mutation hooks that trigger processCards
const useMockGiveClue = () => {
  const queryClient = useQueryClient();
  const { cardData, viewMode, setCardData } = useCardVisibilityStore();

  return useCallback(
    (word: string, count: number) => {
      console.log("🎯 Mutation: giveClue", { word, count });

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

      // Process cards after mutation - Pattern 2!
      const newCardData = processCardTransitions(
        currentData.currentRound.cards,
        cardData,
        viewMode,
      );
      setCardData(newCardData);

      console.log("✅ Clue given, triggering handoff...");
      return updatedData;
    },
    [queryClient, cardData, viewMode, setCardData],
  );
};

const useMockMakeGuess = () => {
  const queryClient = useQueryClient();
  const { cardData, viewMode, setCardData } = useCardVisibilityStore();

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

      // Process cards after mutation - Pattern 2!
      const newCardData = processCardTransitions(updatedCards, cardData, viewMode);
      setCardData(newCardData);

      console.log("✅ Cards updated after guess");
      return updatedData;
    },
    [queryClient, cardData, viewMode, setCardData],
  );
};

// Simple test card to verify fine-grained subscriptions
const SimpleTestCard = React.memo<{ card: Card }>(({ card }) => {
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  // Subscribe ONLY to this card's data
  const cardVisibility = useCardVisibilityStore(
    (state) => state.cardData.get(card.word) || { state: "hidden", animation: null },
  );

  return (
    <div
      style={{
        padding: "1rem",
        border: "2px solid #333",
        borderRadius: "8px",
        background: card.selected ? "#444" : "#222",
        color: "white",
        textAlign: "center",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div>{card.word}</div>
      <div style={{ fontSize: "0.8rem", color: "#aaa" }}>State: {cardVisibility.state}</div>
      <div
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        R:{renderCountRef.current}
      </div>
    </div>
  );
});
const TrackedGameCard = React.memo<{
  card: Card;
  index: number;
  onCardClick: (word: string) => void;
  clickable: boolean;
  isCurrentTeam: boolean;
}>(
  ({ card, index, onCardClick, clickable, isCurrentTeam }) => {
    const renderCountRef = React.useRef(0);
    renderCountRef.current += 1;

    const handleClick = useCallback(() => {
      onCardClick(card.word);
    }, [onCardClick, card.word]);

    return (
      <div style={{ position: "relative" }}>
        <GameCard
          card={card}
          index={index}
          onClick={handleClick}
          clickable={clickable}
          isCurrentTeam={isCurrentTeam}
        />
        <div
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: 10,
          }}
        >
          R:{renderCountRef.current}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary renders
    return (
      prevProps.card === nextProps.card &&
      prevProps.index === nextProps.index &&
      prevProps.clickable === nextProps.clickable &&
      prevProps.isCurrentTeam === nextProps.isCurrentTeam &&
      prevProps.onCardClick === nextProps.onCardClick
    );
  },
);

// Handoff overlay component
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

// Clue input component
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

// Main sandbox component
export const GameFlowSandbox: React.FC = () => {
  const queryClient = useQueryClient();
  const [playerContext, setPlayerContext] = useState<PlayerContext | null>(null);
  const [requiresHandoff, setRequiresHandoff] = useState(true);
  const [cards, setCards] = useState(MOCK_CARDS);
  const [activeTurn, setActiveTurn] = useState<any>(null);
  const [useSimpleCards, setUseSimpleCards] = useState(false);

  const giveClue = useMockGiveClue();
  const makeGuess = useMockMakeGuess();

  // Use selectors to avoid unnecessary re-renders!
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const toggleSpymasterView = useCardVisibilityStore((state) => state.toggleSpymasterView);
  const cardData = useCardVisibilityStore((state) => state.cardData);
  const setCardData = useCardVisibilityStore((state) => state.setCardData);

  // Set up game data in query cache
  React.useEffect(() => {
    const gameData: Partial<GameData> = {
      publicId: "sandbox",
      status: "IN_PROGRESS",
      gameType: "SINGLE_DEVICE",
      gameFormat: "QUICK",
      createdAt: new Date("2024-01-01"), // Use stable date
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

  // Minimal useEffect - only for viewMode changes
  React.useEffect(() => {
    const newCardData = processCardTransitions(cards, cardData, viewMode);
    if (newCardData !== cardData) {
      setCardData(newCardData);
    }
  }, [viewMode, cards, cardData, setCardData]);

  // Initialize cards on mount
  React.useEffect(() => {
    const initialCardData = processCardTransitions(cards, new Map(), viewMode, "hidden");
    setCardData(initialCardData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle player selection
  const handleSelectPlayer = (player: PlayerContext) => {
    setPlayerContext(player);
    setRequiresHandoff(false);

    // Set initial turn if codemaster
    if (player.role === "CODEMASTER") {
      setActiveTurn({
        teamName: player.teamName,
        phase: "GIVE_CLUE",
      });
    }
  };

  // Handle card click
  const handleCardClick = useCallback(
    (word: string) => {
      if (playerContext?.role === "CODEBREAKER" && activeTurn?.guessesRemaining > 0) {
        makeGuess(word);
      }
    },
    [playerContext?.role, activeTurn?.guessesRemaining, makeGuess],
  );

  // Handle clue submission
  const handleGiveClue = (word: string, count: number) => {
    giveClue(word, count);
    // Move to guessing phase
    setActiveTurn({
      ...activeTurn,
      phase: "MAKE_GUESSES",
      clue: { word, count },
      guessesRemaining: count + 1,
    });
    setRequiresHandoff(true);
  };

  // Handle end turn
  const handleEndTurn = () => {
    setActiveTurn({
      teamName: activeTurn.teamName === "red" ? "blue" : "red",
      phase: "GIVE_CLUE",
    });
    setRequiresHandoff(true);
  };

  return (
    <div className={styles.sandbox}>
      <h1>Card Visibility Sandbox - Pattern 2 (Mutation-Driven)</h1>

      {requiresHandoff && <HandoffOverlay onSelectPlayer={handleSelectPlayer} />}

      <div className={styles.controls}>
        <button
          onClick={toggleSpymasterView}
          className={viewMode === "spymaster" ? styles.active : ""}
        >
          {viewMode === "spymaster" ? "🕵️ Spymaster View" : "👤 Player View"}
        </button>
        <button onClick={() => setUseSimpleCards(!useSimpleCards)}>
          {useSimpleCards ? "Use GameCard" : "Use Simple Card"}
        </button>
        {playerContext && (
          <div className={styles.currentPlayer}>
            Playing as: {playerContext.playerName} ({playerContext.role})
          </div>
        )}
      </div>

      <div className={styles.boardContainer}>
        <GameBoardLayout>
          {useSimpleCards
            ? // Simple cards for testing fine-grained subscriptions
              cards.map((card) => (
                <div key={card.word} onClick={() => handleCardClick(card.word)}>
                  <SimpleTestCard card={card} />
                </div>
              ))
            : // Full GameCard components
              cards.map((card, index) => {
                const isClickable =
                  playerContext?.role === "CODEBREAKER" &&
                  (activeTurn?.guessesRemaining || 0) > 0 &&
                  !card.selected;
                const isTeamCard = card.teamName === playerContext?.teamName;

                return (
                  <TrackedGameCard
                    key={card.word}
                    card={card}
                    index={index}
                    onCardClick={handleCardClick}
                    clickable={isClickable}
                    isCurrentTeam={isTeamCard}
                  />
                );
              })}
        </GameBoardLayout>
      </div>

      {playerContext?.role === "CODEMASTER" && activeTurn?.phase === "GIVE_CLUE" && (
        <div className={styles.actionArea}>
          <h3>Give a clue:</h3>
          <ClueInput onSubmit={handleGiveClue} />
        </div>
      )}

      {playerContext?.role === "CODEBREAKER" && activeTurn?.phase === "MAKE_GUESSES" && (
        <div className={styles.actionArea}>
          <h3>Make guesses:</h3>
          <p>
            Clue: {activeTurn.clue?.word} for {activeTurn.clue?.count}
          </p>
          <p>Guesses remaining: {activeTurn.guessesRemaining || 0}</p>
          {activeTurn.guessesRemaining === 0 && <button onClick={handleEndTurn}>End Turn</button>}
        </div>
      )}

      <div className={styles.stateDebug}>
        <h3>Debug State</h3>
        <pre>{JSON.stringify({ viewMode, playerContext, activeTurn }, null, 2)}</pre>
      </div>
    </div>
  );
};
