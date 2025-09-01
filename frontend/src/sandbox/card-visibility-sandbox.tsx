import React, { useState, useCallback, useMemo } from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import styles from "./card-visibility-sandbox.module.css";

// Types
interface Card {
  word: string;
  teamName: "red" | "blue" | "neutral" | "black";
  selected: boolean;
  cardType: "word" | "assassin";
}

type VisualState = "hidden" | "visible" | "visible-colored" | "visible-covered";
type AnimationType =
  | "deal-in"
  | "spymaster-reveal-in"
  | "spymaster-reveal-out"
  | "cover-card"
  | null;

interface CardVisibilityData {
  state: VisualState;
  animation: AnimationType;
}

interface CardTransition {
  from: VisualState;
  to: VisualState;
  animation: AnimationType;
  condition: (card: Card, viewMode: "player" | "spymaster") => boolean;
}

// Mock game data types
interface GameData {
  playerContext?: {
    role: "CODEMASTER" | "CODEBREAKER" | "SPECTATOR" | "NONE";
    playerName: string;
    teamName: string;
  };
  currentRound?: {
    cards: Card[];
    status: "IN_PROGRESS" | "COMPLETED";
  };
  status: "IN_PROGRESS" | "COMPLETED";
}

// State machine types (simplified from your actual implementation)
interface StateTransition {
  type: "scene" | "END";
  target?: string;
}

interface SceneConfig {
  on?: Record<string, StateTransition>;
}

interface StateMachine {
  initial: string;
  scenes: Record<string, SceneConfig>;
}

// State machine transitions
const CARD_TRANSITIONS: CardTransition[] = [
  {
    from: "hidden",
    to: "visible",
    animation: "deal-in",
    condition: () => true,
  },
  {
    from: "visible",
    to: "visible-colored",
    animation: "spymaster-reveal-in",
    condition: (card, viewMode) => viewMode === "spymaster" && !card.selected,
  },
  {
    from: "visible-colored",
    to: "visible",
    animation: "spymaster-reveal-out",
    condition: (_, viewMode) => viewMode === "player",
  },
  {
    from: "visible",
    to: "visible-covered",
    animation: "cover-card",
    condition: (card) => card.selected,
  },
  {
    from: "visible-colored",
    to: "visible-covered",
    animation: "cover-card",
    condition: (card) => card.selected,
  },
];

// Zustand store
interface CardVisibilityStore {
  cardData: Map<string, CardVisibilityData>;
  viewMode: "player" | "spymaster";
  setCardData: (data: Map<string, CardVisibilityData>) => void;
  setViewMode: (mode: "player" | "spymaster") => void;
  resetStore: () => void;
}

const useCardVisibilityStore = create<CardVisibilityStore>()(
  subscribeWithSelector((set) => ({
    cardData: new Map(),
    viewMode: "player",
    setCardData: (data) => set({ cardData: data }),
    setViewMode: (mode) => set({ viewMode: mode }),
    resetStore: () => set({ cardData: new Map(), viewMode: "player" }),
  })),
);

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

// State machines (simplified versions of your actual ones)
const createNoneStateMachine = (): StateMachine => ({
  initial: "lobby",
  scenes: {
    lobby: {
      on: {
        ROUND_CREATED: { type: "scene", target: "dealing" },
      },
    },
    dealing: {
      on: {
        CARDS_DEALT: { type: "END" },
      },
    },
  },
});

const createCodemasterStateMachine = (): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      on: {
        CLUE_GIVEN: { type: "END" },
      },
    },
  },
});

const createCodebreakerStateMachine = (): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      on: {
        CORRECT_GUESS_CONTINUE: { type: "scene", target: "main" },
        WRONG_GUESS: { type: "scene", target: "outcome" },
      },
    },
    outcome: {
      on: {
        OUTCOME_ACKNOWLEDGED: { type: "END" },
      },
    },
  },
});

const getStateMachine = (role: string): StateMachine => {
  switch (role) {
    case "CODEMASTER":
      return createCodemasterStateMachine();
    case "CODEBREAKER":
      return createCodebreakerStateMachine();
    case "NONE":
    default:
      return createNoneStateMachine();
  }
};

/**
 * Card component
 */
const GameCard = React.memo<{ card: Card; onCardClick: (word: string) => void }>(
  ({ card, onCardClick }) => {
    const renderCountRef = React.useRef(0);
    renderCountRef.current += 1;

    const cardVisibility = useCardVisibilityStore(
      (state) => state.cardData.get(card.word) || { state: "hidden", animation: null },
    );

    const handleClick = useCallback(() => {
      onCardClick(card.word);
    }, [onCardClick, card.word]);

    const handleAnimationEnd = useCallback(() => {
      const store = useCardVisibilityStore.getState();
      const updatedData = new Map(store.cardData);
      const current = updatedData.get(card.word);
      if (current) {
        updatedData.set(card.word, { ...current, animation: null });
        store.setCardData(updatedData);
      }
    }, [card.word]);

    const showColor = cardVisibility.state === "visible-colored";

    const cardClasses = [
      styles.cardWrapper,
      card.selected && styles.selected,
      showColor && styles[`color${card.teamName.charAt(0).toUpperCase() + card.teamName.slice(1)}`],
      cardVisibility.animation &&
        styles[
          `animate${cardVisibility.animation
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join("")}`
        ],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cardClasses} onClick={handleClick} onAnimationEnd={handleAnimationEnd}>
        <div className={styles.cardWord}>{card.word}</div>
        <div className={styles.cardState}>State: {cardVisibility.state}</div>
        <div className={styles.renderCount}>R:{renderCountRef.current}</div>
      </div>
    );
  },
);

/**
 * Process card transitions
 */
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
      if (!updatedData) updatedData = new Map(currentCardData);
      const newState = card.selected ? "visible-covered" : initialState;
      updatedData.set(card.word, {
        state: newState,
        animation: initialState === "hidden" ? "deal-in" : null,
      });
      hasChanges = true;
      return;
    }

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

  return hasChanges && updatedData ? updatedData : currentCardData;
};

/**
 * Board component that manages visibility
 */
const GameBoard: React.FC<{
  cards: Card[];
  onCardClick: (word: string) => void;
  initialState: VisualState;
  role: string;
}> = ({ cards, onCardClick, initialState, role }) => {
  const { cardData, viewMode, setCardData } = useCardVisibilityStore();

  // Set view mode based on role
  React.useEffect(() => {
    const newViewMode = role === "CODEMASTER" ? "spymaster" : "player";
    useCardVisibilityStore.setState({ viewMode: newViewMode });
  }, [role]);

  // Process transitions when cards or viewMode change
  React.useEffect(() => {
    const newCardData = processCardTransitions(cards, cardData, viewMode, initialState);
    if (newCardData !== cardData) {
      setCardData(newCardData);
    }
  }, [cards, viewMode, initialState]);

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <GameCard key={card.word} card={card} onCardClick={onCardClick} />
      ))}
    </div>
  );
};

/**
 * Scene component that handles different game states
 */
const GameScene: React.FC<{
  gameData: GameData;
  currentScene: string;
  onCardClick: (word: string) => void;
}> = ({ gameData, currentScene, onCardClick }) => {
  const role = gameData.playerContext?.role || "NONE";
  const cards = gameData.currentRound?.cards || [];

  // Determine initial state based on scene
  const getInitialState = (): VisualState => {
    if (role === "NONE" && currentScene === "dealing") return "hidden";
    return "visible";
  };

  const getMessage = () => {
    switch (`${role}.${currentScene}`) {
      case "NONE.lobby":
        return "Waiting for game to start...";
      case "NONE.dealing":
        return "Dealing cards...";
      case "CODEMASTER.main":
        return "Give a clue to your team";
      case "CODEBREAKER.main":
        return "Make a guess based on the clue";
      case "CODEBREAKER.outcome":
        return "Review the outcome";
      default:
        return `${role} - ${currentScene}`;
    }
  };

  return (
    <div className={styles.sceneContainer}>
      <h3 className={styles.sceneTitle}>{getMessage()}</h3>
      <GameBoard
        key={`${role}-${currentScene}`} // Force remount on scene change
        cards={cards}
        onCardClick={onCardClick}
        initialState={getInitialState()}
        role={role}
      />
    </div>
  );
};

/**
 * Main sandbox component with game flow simulation
 */
export default function CardVisibilitySandbox() {
  const [gameData, setGameData] = useState<GameData>({
    playerContext: { role: "NONE", playerName: "Player 1", teamName: "red" },
    currentRound: { cards: MOCK_CARDS, status: "IN_PROGRESS" },
    status: "IN_PROGRESS",
  });

  const [currentScene, setCurrentScene] = useState("lobby");
  const resetStore = useCardVisibilityStore((state) => state.resetStore);

  const currentRole = gameData.playerContext?.role || "NONE";
  const stateMachine = useMemo(() => getStateMachine(currentRole), [currentRole]);

  // Handle scene transitions
  const triggerSceneTransition = useCallback(
    (event: string) => {
      const transition = stateMachine.scenes[currentScene]?.on?.[event];
      if (!transition) {
        console.warn(`No transition found for event: ${event} in scene: ${currentScene}`);
        return;
      }

      if (transition.type === "END") {
        // Simulate moving to next player
        handleTurnComplete();
      } else if (transition.type === "scene" && transition.target) {
        setCurrentScene(transition.target);
      }
    },
    [currentScene, stateMachine],
  );

  // Simulate turn completion and handoff
  const handleTurnComplete = useCallback(() => {
    // Clear player context (handoff state)
    setGameData((prev) => ({
      ...prev,
      playerContext: undefined,
    }));
    setCurrentScene("handoff");
  }, []);

  // Handle player selection after handoff
  const handlePlayerSelect = useCallback(
    (role: "CODEMASTER" | "CODEBREAKER") => {
      setGameData((prev) => ({
        ...prev,
        playerContext: {
          role,
          playerName: role === "CODEMASTER" ? "Master" : "Breaker",
          teamName: "red",
        },
      }));
      const machine = getStateMachine(role);
      setCurrentScene(machine.initial);
      resetStore(); // Reset visibility store for new player
    },
    [resetStore],
  );

  // Handle card clicks based on current role
  const handleCardClick = useCallback(
    (word: string) => {
      if (currentRole === "CODEBREAKER" && currentScene === "main") {
        // Update card selection
        setGameData((prev) => ({
          ...prev,
          currentRound: {
            ...prev.currentRound!,
            cards: prev.currentRound!.cards.map((card) =>
              card.word === word ? { ...card, selected: true } : card,
            ),
          },
        }));

        // Simulate guess outcome
        const card = gameData.currentRound?.cards.find((c) => c.word === word);
        if (card?.teamName === "red") {
          triggerSceneTransition("CORRECT_GUESS_CONTINUE");
        } else {
          triggerSceneTransition("WRONG_GUESS");
        }
      }
    },
    [currentRole, currentScene, gameData.currentRound?.cards, triggerSceneTransition],
  );

  // Game flow simulation functions
  const startGame = () => {
    triggerSceneTransition("ROUND_CREATED");
  };

  const dealCards = () => {
    triggerSceneTransition("CARDS_DEALT");
  };

  const giveClue = () => {
    triggerSceneTransition("CLUE_GIVEN");
  };

  const acknowledgeOutcome = () => {
    triggerSceneTransition("OUTCOME_ACKNOWLEDGED");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Card Visibility Game Flow Sandbox</h1>

      <div className={styles.controls}>
        <div className={styles.stateInfo}>
          <div>
            Role: <strong>{currentRole}</strong>
          </div>
          <div>
            Scene: <strong>{currentScene}</strong>
          </div>
        </div>

        {currentScene === "handoff" && (
          <div className={styles.handoffControls}>
            <h3>Device Handoff - Select Player:</h3>
            <button className={styles.button} onClick={() => handlePlayerSelect("CODEMASTER")}>
              Red Codemaster
            </button>
            <button className={styles.button} onClick={() => handlePlayerSelect("CODEBREAKER")}>
              Red Codebreaker
            </button>
          </div>
        )}

        {currentRole === "NONE" && currentScene === "lobby" && (
          <button className={styles.button} onClick={startGame}>
            Start Game
          </button>
        )}

        {currentRole === "NONE" && currentScene === "dealing" && (
          <button className={styles.button} onClick={dealCards}>
            Complete Dealing
          </button>
        )}

        {currentRole === "CODEMASTER" && currentScene === "main" && (
          <button className={styles.button} onClick={giveClue}>
            Give Clue
          </button>
        )}

        {currentRole === "CODEBREAKER" && currentScene === "outcome" && (
          <button className={styles.button} onClick={acknowledgeOutcome}>
            Continue
          </button>
        )}
      </div>

      {currentScene !== "handoff" && (
        <GameScene gameData={gameData} currentScene={currentScene} onCardClick={handleCardClick} />
      )}
    </div>
  );
}
