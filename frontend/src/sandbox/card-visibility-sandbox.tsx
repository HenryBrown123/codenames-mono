// card-visibility-sandbox.tsx
import React, { memo, useCallback, useState } from "react";
import styles from "./card-visibility-sandbox.module.css";
import {
  Card,
  GameData,
  GameEvent,
  ViewMode,
  CARD_ANIMATIONS,
  useCardVisibilityStore,
  useCardVisibility,
  AnimationContainer,
} from "./card-visbility-sandbox.hooks";

// ============= DEMO COMPONENTS =============
const GameCard = memo<{
  card: Card;
  index: number;
  onClick: (word: string) => void;
  initialState?: "hidden" | "visible";
}>(({ card, index, onClick, initialState = "hidden" }) => {
  const { state, animationEvent, completeTransition } = useCardVisibility(card, initialState);

  // Only apply team color to base card if NOT selected and in colored state
  const teamColor =
    !card.selected && card.teamName && state === "visible-colored"
      ? styles[`color${card.teamName.charAt(0).toUpperCase()}${card.teamName.slice(1)}`]
      : "";

  const handleClick = () => {
    if (!card.selected && state !== "hidden") {
      onClick(card.word);
    }
  };

  return (
    <AnimationContainer
      event={animationEvent}
      index={index}
      onComplete={completeTransition}
      animations={CARD_ANIMATIONS}
      cardId={card.word}
    >
      <div
        className={`${styles.cardWrapper} ${card.selected ? styles.selected : ""} ${teamColor} card-container`}
        onClick={handleClick}
        data-state={state}
      >
        <div className={`${styles.cardWord} card-word`}>{card.word}</div>
        <div className={`${styles.cardBadge} card-badge`}>
          {state === "visible-colored" && card.teamName}
        </div>
        <div className={styles.cardState}>
          {state} {animationEvent && `(${animationEvent})`}
        </div>
        {card.selected && card.teamName && (
          <div
            className={`${styles.coverCard} ${
              styles[`cover${card.teamName.charAt(0).toUpperCase()}${card.teamName.slice(1)}`]
            } cover-card`}
          >
            <div className={styles.coverWord}>{card.word}</div>
            <div className={styles.coverTeam}>{card.teamName}</div>
          </div>
        )}
      </div>
    </AnimationContainer>
  );
});

GameCard.displayName = "GameCard";

// ============= SWIMLANE VISUALIZER =============
const SwimlanesVisualizer: React.FC = () => {
  const animationTrackers = useCardVisibilityStore((s) => s.animationTrackers);

  const pending = animationTrackers.filter((t) => t.status === "pending");
  const running = animationTrackers.filter((t) => t.status === "running");
  const finished = animationTrackers.filter((t) => t.status === "finished");

  return (
    <div className={styles.swimlanes}>
      <h2 className={styles.swimlanesTitle}>Animation Timeline</h2>
      <div className={styles.swimlanesContainer}>
        <div className={styles.swimlane}>
          <div className={`${styles.swimlaneHeader} ${styles.pending}`}>
            Pending ({pending.length})
          </div>
          <div className={styles.swimlaneContent}>
            {pending.map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                className={styles.swimlaneItem}
              >
                <div className={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div className={styles.swimlaneItemElement}>{tracker.elementName}</div>
                {tracker.event && <div className={styles.swimlaneItemEvent}>{tracker.event}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.swimlane}>
          <div className={`${styles.swimlaneHeader} ${styles.running}`}>
            Running ({running.length})
          </div>
          <div className={styles.swimlaneContent}>
            {running.map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                className={styles.swimlaneItem}
              >
                <div className={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div className={styles.swimlaneItemElement}>{tracker.elementName}</div>
                {tracker.event && <div className={styles.swimlaneItemEvent}>{tracker.event}</div>}
                <div className={styles.swimlaneProgress}>
                  <div
                    className={styles.swimlaneProgressBar}
                    style={{ width: `${tracker.progress * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.swimlane}>
          <div className={`${styles.swimlaneHeader} ${styles.finished}`}>
            Finished ({finished.length})
          </div>
          <div className={styles.swimlaneContent}>
            {finished.slice(-10).map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                className={`${styles.swimlaneItem} ${styles.finished}`}
              >
                <div className={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div className={styles.swimlaneItemElement}>{tracker.elementName}</div>
                {tracker.event && <div className={styles.swimlaneItemEvent}>{tracker.event}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= DEMO SCENES =============
const DealInScene: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const reset = useCardVisibilityStore((s) => s.reset);

  const dealCards = useCallback(() => {
    reset();
    const words = ["APPLE", "BANANA", "CHERRY", "DATE", "ELDERBERRY", "FIG", "GRAPE", "HONEYDEW"];
    const newCards = words.map((word) => ({
      word,
      selected: false,
    }));
    setCards(newCards);
  }, [reset]);

  return (
    <div>
      <h2 className={styles.sceneTitle}>Scene 1: Cards Deal In</h2>
      <div className={styles.controls}>
        <button className={styles.button} onClick={dealCards}>
          Deal Cards
        </button>
        <button className={styles.buttonDanger} onClick={() => setCards([])}>
          Clear
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard key={card.word} card={card} index={i} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
};

const SpymasterViewScene: React.FC = () => {
  const [gameData] = useState<GameData[]>([
    { word: "OCEAN", teamName: "blue" },
    { word: "FIRE", teamName: "red" },
    { word: "MOUNTAIN", teamName: "neutral" },
    { word: "SHADOW", teamName: "assassin" },
    { word: "RIVER", teamName: "blue" },
    { word: "SUNSET", teamName: "red" },
    { word: "FOREST", teamName: "neutral" },
    { word: "STORM", teamName: "blue" },
  ]);

  const [cards] = useState<Card[]>(
    gameData.map((data) => ({
      word: data.word,
      teamName: data.teamName,
      selected: false,
    })),
  );

  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const toggleViewMode = useCardVisibilityStore((s) => s.toggleViewMode);

  return (
    <div>
      <h2 className={styles.sceneTitle}>Scene 2: Spymaster View Toggle</h2>
      <div className={styles.stateInfo}>
        <strong>View Mode:</strong> {viewMode}
      </div>
      <div className={styles.controls}>
        <button
          className={viewMode === "spymaster" ? styles.buttonActive : styles.button}
          onClick={toggleViewMode}
        >
          Toggle Spymaster View
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={() => {}}
            initialState="visible"
          />
        ))}
      </div>
    </div>
  );
};

const PlayerSelectionScene: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([
    { word: "OCEAN", selected: false },
    { word: "FIRE", selected: false },
    { word: "MOUNTAIN", selected: false },
    { word: "SHADOW", selected: false },
    { word: "RIVER", selected: false },
    { word: "SUNSET", selected: false },
  ]);

  const gameData: GameData[] = [
    { word: "OCEAN", teamName: "blue" },
    { word: "FIRE", teamName: "red" },
    { word: "MOUNTAIN", teamName: "neutral" },
    { word: "SHADOW", teamName: "assassin" },
    { word: "RIVER", teamName: "blue" },
    { word: "SUNSET", teamName: "red" },
  ];

  const handleCardClick = useCallback(
    (word: string) => {
      setCards((prev) =>
        prev.map((card) => {
          if (card.word === word) {
            const gameCard = gameData.find((g) => g.word === word);
            return {
              ...card,
              selected: true,
              teamName: gameCard?.teamName,
            };
          }
          return card;
        }),
      );
    },
    [gameData],
  );

  const resetCards = useCallback(() => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        selected: false,
        teamName: undefined,
      })),
    );
  }, []);

  return (
    <div>
      <h2 className={styles.sceneTitle}>Scene 3: Player Card Selection</h2>
      <div className={styles.controls}>
        <button className={styles.buttonDanger} onClick={resetCards}>
          Reset Selections
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={handleCardClick}
            initialState="visible"
          />
        ))}
      </div>
    </div>
  );
};

const PerformanceStressTest: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const toggleViewMode = useCardVisibilityStore((s) => s.toggleViewMode);
  const reset = useCardVisibilityStore((s) => s.reset);
  const setTimeScale = useCardVisibilityStore((s) => s.setTimeScale);

  const teams: Array<"red" | "blue" | "neutral" | "assassin"> = [
    "red",
    "blue",
    "neutral",
    "assassin",
  ];

  // Generate a massive grid
  const generateCards = useCallback((count: number) => {
    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(`WORD${i.toString().padStart(3, "0")}`);
    }
    return words.map((word, i) => ({
      word,
      teamName: teams[i % teams.length],
      selected: false,
    }));
  }, []);

  const startChaos = useCallback(() => {
    reset();
    setIsRunning(true);

    // Start with 100 cards
    const initialCards = generateCards(100);
    setCards(initialCards);

    // Randomly select cards over time
    let selectionCount = 0;
    const selectionInterval = setInterval(() => {
      if (selectionCount >= 20) {
        clearInterval(selectionInterval);
        return;
      }

      setCards((prev) => {
        const unselected = prev.filter((c) => !c.selected);
        if (unselected.length === 0) return prev;

        const randomIndex = Math.floor(Math.random() * unselected.length);
        const cardToSelect = unselected[randomIndex];

        return prev.map((card) =>
          card.word === cardToSelect.word ? { ...card, selected: true } : card,
        );
      });
      selectionCount++;
    }, 500);

    // Toggle view mode periodically
    let toggleCount = 0;
    const toggleInterval = setInterval(() => {
      if (toggleCount >= 10) {
        clearInterval(toggleInterval);
        setIsRunning(false);
        return;
      }
      toggleViewMode();
      toggleCount++;
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(selectionInterval);
      clearInterval(toggleInterval);
      setIsRunning(false);
    };
  }, [generateCards, reset, toggleViewMode]);

  const waveDealIn = useCallback(() => {
    reset();
    const waveCards = generateCards(64);

    // Deal in waves with different delays
    waveCards.forEach((card, i) => {
      setTimeout(
        () => {
          setCards((prev) => [...prev, card]);
        },
        Math.floor(i / 8) * 200,
      ); // Groups of 8
    });
  }, [generateCards, reset]);

  const spiralDealIn = useCallback(() => {
    reset();
    const gridSize = 10;
    const spiralCards = generateCards(gridSize * gridSize);

    // Calculate spiral order
    const spiralOrder: number[] = [];
    let top = 0,
      bottom = gridSize - 1,
      left = 0,
      right = gridSize - 1;

    while (top <= bottom && left <= right) {
      for (let i = left; i <= right; i++) spiralOrder.push(top * gridSize + i);
      top++;
      for (let i = top; i <= bottom; i++) spiralOrder.push(i * gridSize + right);
      right--;
      if (top <= bottom) {
        for (let i = right; i >= left; i--) spiralOrder.push(bottom * gridSize + i);
        bottom--;
      }
      if (left <= right) {
        for (let i = bottom; i >= top; i--) spiralOrder.push(i * gridSize + left);
        left++;
      }
    }

    spiralOrder.forEach((index, order) => {
      setTimeout(() => {
        setCards((prev) => {
          const newCards = [...prev];
          newCards[index] = spiralCards[index];
          return newCards.filter(Boolean);
        });
      }, order * 30);
    });
  }, [generateCards, reset]);

  return (
    <div>
      <h2 className={styles.sceneTitle}>Scene 4: Performance Stress Test 🚀</h2>

      <div className={styles.controls}>
        <button
          className={isRunning ? styles.buttonActive : styles.button}
          onClick={startChaos}
          disabled={isRunning}
        >
          {isRunning ? "🔥 CHAOS MODE ACTIVE 🔥" : "Start Chaos Mode (100 cards)"}
        </button>

        <button className={styles.button} onClick={waveDealIn}>
          Wave Deal (64 cards)
        </button>

        <button className={styles.button} onClick={spiralDealIn}>
          Spiral Deal (100 cards)
        </button>

        <button className={styles.button} onClick={() => setTimeScale(0.1)}>
          HYPERSPEED (0.1x)
        </button>

        <button
          className={styles.buttonDanger}
          onClick={() => {
            reset();
            setCards([]);
          }}
        >
          Reset All
        </button>
      </div>

      <div className={styles.stateInfo}>
        <strong>Cards:</strong> {cards.length} |<strong> Selected:</strong>{" "}
        {cards.filter((c) => c.selected).length} |<strong> View:</strong> {viewMode}
      </div>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))" }}
      >
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={() => {}}
            initialState="hidden"
          />
        ))}
      </div>
    </div>
  );
};

const HandoffSimulationScene: React.FC = () => {
  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const setViewMode = useCardVisibilityStore((s) => s.setViewMode);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [cards] = useState<Card[]>([
    { word: "OCEAN", teamName: "blue", selected: false },
    { word: "FIRE", teamName: "red", selected: false },
    { word: "MOUNTAIN", teamName: "neutral", selected: false },
    { word: "SHADOW", teamName: "assassin", selected: false },
  ]);

  const simulateHandoff = useCallback(() => {
    setIsPending(true);
    setIsSuccess(false);

    setTimeout(() => {
      setViewMode(viewMode === "normal" ? "spymaster" : "normal");
      setIsPending(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  }, [viewMode, setViewMode]);

  return (
    <div>
      <h2 className={styles.sceneTitle}>Scene 4: Turn Handoff Simulation</h2>

      <div className={styles.handoffControls}>
        <h3>Current Player: {viewMode === "spymaster" ? "Spymaster" : "Field Operative"}</h3>
        <button className={styles.button} onClick={simulateHandoff} disabled={isPending}>
          {isPending ? "Handing off..." : "Hand Off Turn"}
        </button>
        <div
          className={`${styles.viewIndicator} ${
            viewMode === "spymaster" ? styles.spymaster : styles.player
          }`}
        >
          {viewMode.toUpperCase()} VIEW
        </div>
      </div>

      {isPending && (
        <div className={styles.pendingMessage}>
          <div className={styles.spinner}></div>
          <span>Processing turn handoff...</span>
        </div>
      )}

      {isSuccess && (
        <div className={styles.successMessage}>
          <span>✓ Turn handed off successfully!</span>
        </div>
      )}

      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={() => {}}
            initialState="visible"
          />
        ))}
      </div>
    </div>
  );
};

// ============= MAIN SANDBOX =============
export const CardVisibilitySandbox: React.FC = () => {
  const [activeScene, setActiveScene] = useState(1);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const setTimeScale = useCardVisibilityStore((s) => s.setTimeScale);

  const reset = useCardVisibilityStore((s) => s.reset);

  React.useEffect(() => {
    reset();
  }, [activeScene, reset]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Card Visibility Animation System</h1>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <strong>Animation Speed:</strong>
            <button className={styles.button} onClick={() => setTimeScale(0.5)}>
              0.5x
            </button>
            <button
              className={timeScale === 1 ? styles.buttonActive : styles.button}
              onClick={() => setTimeScale(1)}
            >
              1x
            </button>
            <button className={styles.button} onClick={() => setTimeScale(2)}>
              2x
            </button>
          </div>

          <div className={styles.controlGroup}>
            <strong>Scene:</strong>
            {[1, 2, 3, 4].map((scene) => (
              <button
                key={scene}
                className={activeScene === scene ? styles.buttonActive : styles.button}
                onClick={() => setActiveScene(scene)}
              >
                Scene {scene}
              </button>
            ))}
          </div>
        </div>

        {activeScene === 1 && <DealInScene />}
        {activeScene === 2 && <SpymasterViewScene />}
        {activeScene === 3 && <PlayerSelectionScene />}
        {activeScene === 4 && <PerformanceStressTest />}

        <SwimlanesVisualizer />
      </div>
    </div>
  );
};

export default CardVisibilitySandbox;
