import React, { memo, useCallback, useState, useEffect } from "react";
import { create } from "zustand";

// ============= TYPES =============
export interface AnimationTracker {
  cardId: string;
  elementName: string;
  startTime: number;
  duration: number;
  trigger: string;
}

export type CardDisplayState = "hidden" | "visible" | "visible-colored" | "visible-covered";
export type ViewMode = "normal" | "spymaster";

export interface Card {
  word: string;
  teamName?: "red" | "blue" | "neutral" | "assassin";
  selected: boolean;
}

export interface GameData {
  word: string;
  teamName?: "red" | "blue" | "neutral" | "assassin";
}

// ============= STORE =============
interface CardVisibilityStore {
  viewMode: ViewMode;
  timeScale: number;
  animationTrackers: AnimationTracker[];

  toggleViewMode: () => void;
  reset: () => void;
  actions: {
    setTimeScale: (scale: number) => void;
    updateAnimationTracker: (tracker: AnimationTracker) => void;
    clearAnimationTrackers: (cardId: string) => void;
  };
}

const useCardVisibilityStore = create<CardVisibilityStore>((set) => ({
  viewMode: "normal",
  timeScale: 1,
  animationTrackers: [],

  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "normal" ? "spymaster" : "normal",
    })),

  reset: () =>
    set({
      viewMode: "normal",
      animationTrackers: [],
    }),

  actions: {
    setTimeScale: (scale) => set({ timeScale: scale }),

    updateAnimationTracker: (tracker) =>
      set((state) => ({
        animationTrackers: [
          ...state.animationTrackers.filter(
            (t) => !(t.cardId === tracker.cardId && t.elementName === tracker.elementName),
          ),
          tracker,
        ],
      })),

    clearAnimationTrackers: (cardId) =>
      set((state) => ({
        animationTrackers: state.animationTrackers.filter((t) => t.cardId !== cardId),
      })),
  },
}));

// ============= CARD VISIBILITY HOOK =============
function useCardVisibility(card: Card, initialState: CardDisplayState = "hidden") {
  const [state, setState] = useState<CardDisplayState>(initialState);
  const [animationEvent, setAnimationEvent] = useState<string | null>(null);
  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const updateTracker = useCardVisibilityStore((s) => s.actions.updateAnimationTracker);
  const clearTrackers = useCardVisibilityStore((s) => s.actions.clearAnimationTrackers);

  useEffect(() => {
    let targetState = state;
    let event: string | null = null;

    if (card.selected && card.teamName) {
      targetState = "visible-covered";
      if (state !== targetState) event = "cover-card";
    } else if (viewMode === "spymaster" && card.teamName) {
      targetState = "visible-colored";
      if (state === "visible") event = "spymaster-reveal";
    } else if (viewMode === "normal") {
      targetState = "visible";
      if (state === "hidden") event = "deal-in";
      else if (state === "visible-colored") event = "spymaster-hide";
    }

    if (targetState !== state && event) {
      setAnimationEvent(event);
      setState(targetState);

      // Track animation for swimlanes
      const duration = event === "deal-in" ? 600 : 400;
      updateTracker({
        cardId: card.word,
        elementName: "container",
        startTime: Date.now(),
        duration,
        trigger: event,
      });
    }
  }, [card, viewMode, state, updateTracker]);

  const completeTransition = useCallback(() => {
    setAnimationEvent(null);
  }, []);

  return { state, animationEvent, completeTransition };
}

// ============= ANIMATION CONTAINER =============
interface AnimationContainerProps {
  event: string | null;
  index: number;
  onComplete: () => void;
  animations: Record<string, any>;
  cardId: string;
  children: React.ReactNode;
}

const AnimationContainer: React.FC<AnimationContainerProps> = ({
  event,
  index,
  onComplete,
  children,
}) => {
  const timeScale = useCardVisibilityStore((s) => s.timeScale);

  useEffect(() => {
    if (event) {
      const duration = 600 / timeScale;
      const timer = setTimeout(onComplete, duration + index * 50);
      return () => clearTimeout(timer);
    }
  }, [event, index, timeScale, onComplete]);

  return <>{children}</>;
};

// ============= STYLES =============
const styles = {
  container: { padding: "2rem", backgroundColor: "#1a1a1a", color: "white", minHeight: "100vh" },
  wrapper: { maxWidth: "1400px", margin: "0 auto" },
  title: { fontSize: "2rem", marginBottom: "2rem", textAlign: "center" as const },
  controls: { display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap" as const },
  controlGroup: { display: "flex", gap: "0.5rem", alignItems: "center" },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#333",
    color: "white",
    border: "1px solid #555",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonActive: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "1px solid #007bff",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonDanger: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "1px solid #dc3545",
    borderRadius: "4px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  cardWrapper: {
    position: "relative" as const,
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
    padding: "1rem",
    cursor: "pointer",
    transition: "all 0.3s",
    minHeight: "100px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #444",
  },
  selected: { pointerEvents: "none" as const },
  cardWord: { fontSize: "1.2rem", fontWeight: "bold" as const, marginBottom: "0.5rem" },
  cardBadge: {
    fontSize: "0.8rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    backgroundColor: "#444",
    marginTop: "0.5rem",
  },
  cardState: { fontSize: "0.7rem", color: "#888", marginTop: "0.5rem" },
  coverCard: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#555",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  coverWord: { fontSize: "1rem", fontWeight: "bold" as const },
  coverTeam: { fontSize: "0.8rem", marginTop: "0.25rem" },
  colorRed: { borderColor: "#ff0040" },
  colorBlue: { borderColor: "#00d4ff" },
  colorNeutral: { borderColor: "#ffd700" },
  colorAssassin: { borderColor: "#800080" },
  coverRed: { backgroundColor: "#ff0040" },
  coverBlue: { backgroundColor: "#00d4ff" },
  coverNeutral: { backgroundColor: "#ffd700" },
  coverAssassin: { backgroundColor: "#800080" },
  sceneTitle: { fontSize: "1.5rem", marginBottom: "1rem" },
  stateInfo: {
    marginBottom: "1rem",
    padding: "0.5rem",
    backgroundColor: "#333",
    borderRadius: "4px",
  },

  // Swimlanes styles
  swimlanes: { marginTop: "3rem", padding: "1rem", backgroundColor: "#222", borderRadius: "8px" },
  swimlanesTitle: { fontSize: "1.3rem", marginBottom: "1rem", color: "#fff" },
  swimlanesContainer: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" },
  swimlane: { backgroundColor: "#2a2a2a", borderRadius: "4px", overflow: "hidden" },
  swimlaneHeader: {
    padding: "0.5rem",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    color: "white",
  },
  pending: { backgroundColor: "#ffc107" },
  running: { backgroundColor: "#28a745" },
  finished: { backgroundColor: "#6c757d" },
  swimlaneContent: { padding: "0.5rem", minHeight: "100px" },
  swimlaneItem: {
    backgroundColor: "#333",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
  },
  swimlaneItemTitle: { fontWeight: "bold" as const, marginBottom: "0.25rem" },
  swimlaneItemElement: { color: "#888", fontSize: "0.75rem" },
  swimlaneItemEvent: { color: "#00d4ff", fontSize: "0.75rem", marginTop: "0.25rem" },
  swimlaneProgress: {
    height: "4px",
    backgroundColor: "#555",
    borderRadius: "2px",
    marginTop: "0.25rem",
    overflow: "hidden",
  },
  swimlaneProgressBar: {
    height: "100%",
    backgroundColor: "#00d4ff",
    transition: "width 0.3s",
  },
};

// ============= GAME CARD COMPONENT =============
const GameCard = memo<{
  card: Card;
  index: number;
  onClick: (word: string) => void;
  initialState?: CardDisplayState;
}>(({ card, index, onClick, initialState = "hidden" }) => {
  const { state, animationEvent, completeTransition } = useCardVisibility(card, initialState);

  const teamColor =
    !card.selected && card.teamName && state === "visible-colored"
      ? styles[
          `color${card.teamName.charAt(0).toUpperCase()}${card.teamName.slice(1)}` as keyof typeof styles
        ]
      : {};

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
      animations={{}}
      cardId={card.word}
    >
      <div
        style={{ ...styles.cardWrapper, ...teamColor, ...(card.selected ? styles.selected : {}) }}
        onClick={handleClick}
      >
        <div style={styles.cardWord}>{card.word}</div>
        {state === "visible-colored" && card.teamName && (
          <div style={styles.cardBadge}>{card.teamName}</div>
        )}
        <div style={styles.cardState}>
          {state} {animationEvent && `(${animationEvent})`}
        </div>
        {card.selected && card.teamName && (
          <div
            style={{
              ...styles.coverCard,
              ...styles[
                `cover${card.teamName.charAt(0).toUpperCase()}${card.teamName.slice(1)}` as keyof typeof styles
              ],
            }}
          >
            <div style={styles.coverWord}>{card.word}</div>
            <div style={styles.coverTeam}>{card.teamName}</div>
          </div>
        )}
      </div>
    </AnimationContainer>
  );
});

GameCard.displayName = "GameCard";

// ============= SWIMLANES VISUALIZER =============
const SwimlanesVisualizer: React.FC = () => {
  const animationTrackers = useCardVisibilityStore((s) => s.animationTrackers);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);

  const categorizedTrackers = animationTrackers.reduce(
    (acc, tracker) => {
      const elapsed = currentTime - tracker.startTime;
      const progress = Math.min(elapsed / tracker.duration, 1);

      if (progress < 0) {
        acc.pending.push({ ...tracker, progress });
      } else if (progress < 1) {
        acc.running.push({ ...tracker, progress });
      } else {
        acc.finished.push({ ...tracker, progress });
      }

      return acc;
    },
    { pending: [] as any[], running: [] as any[], finished: [] as any[] },
  );

  return (
    <div style={styles.swimlanes}>
      <h2 style={styles.swimlanesTitle}>Animation Timeline</h2>
      <div style={styles.swimlanesContainer}>
        <div style={styles.swimlane}>
          <div style={{ ...styles.swimlaneHeader, ...styles.pending }}>
            Pending ({categorizedTrackers.pending.length})
          </div>
          <div style={styles.swimlaneContent}>
            {categorizedTrackers.pending.map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                style={styles.swimlaneItem}
              >
                <div style={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div style={styles.swimlaneItemElement}>{tracker.elementName}</div>
                <div style={styles.swimlaneItemEvent}>{tracker.trigger}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.swimlane}>
          <div style={{ ...styles.swimlaneHeader, ...styles.running }}>
            Running ({categorizedTrackers.running.length})
          </div>
          <div style={styles.swimlaneContent}>
            {categorizedTrackers.running.map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                style={styles.swimlaneItem}
              >
                <div style={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div style={styles.swimlaneItemElement}>{tracker.elementName}</div>
                <div style={styles.swimlaneItemEvent}>{tracker.trigger}</div>
                <div style={styles.swimlaneProgress}>
                  <div
                    style={{ ...styles.swimlaneProgressBar, width: `${tracker.progress * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.swimlane}>
          <div style={{ ...styles.swimlaneHeader, ...styles.finished }}>
            Finished ({categorizedTrackers.finished.length})
          </div>
          <div style={styles.swimlaneContent}>
            {categorizedTrackers.finished.slice(-10).map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                style={styles.swimlaneItem}
              >
                <div style={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div style={styles.swimlaneItemElement}>{tracker.elementName}</div>
                <div style={styles.swimlaneItemEvent}>{tracker.trigger}</div>
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
      <h2 style={styles.sceneTitle}>Scene 1: Cards Deal In</h2>
      <div style={styles.controls}>
        <button style={styles.button} onClick={dealCards}>
          Deal Cards
        </button>
        <button style={styles.buttonDanger} onClick={() => setCards([])}>
          Clear
        </button>
      </div>
      <div style={styles.grid}>
        {cards.map((card, i) => (
          <GameCard key={card.word} card={card} index={i} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
};

const SpymasterViewScene: React.FC = () => {
  const [cards] = useState<Card[]>([
    { word: "OCEAN", teamName: "blue", selected: false },
    { word: "FIRE", teamName: "red", selected: false },
    { word: "MOUNTAIN", teamName: "neutral", selected: false },
    { word: "SHADOW", teamName: "assassin", selected: false },
    { word: "RIVER", teamName: "blue", selected: false },
    { word: "SUNSET", teamName: "red", selected: false },
    { word: "FOREST", teamName: "neutral", selected: false },
    { word: "STORM", teamName: "blue", selected: false },
  ]);

  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const toggleViewMode = useCardVisibilityStore((s) => s.toggleViewMode);

  return (
    <div>
      <h2 style={styles.sceneTitle}>Scene 2: Spymaster View Toggle</h2>
      <div style={styles.stateInfo}>
        <strong>View Mode:</strong> {viewMode}
      </div>
      <div style={styles.controls}>
        <button
          style={viewMode === "spymaster" ? styles.buttonActive : styles.button}
          onClick={toggleViewMode}
        >
          Toggle Spymaster View
        </button>
      </div>
      <div style={styles.grid}>
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

  const handleCardClick = useCallback((word: string) => {
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
  }, []);

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
      <h2 style={styles.sceneTitle}>Scene 3: Player Card Selection</h2>
      <div style={styles.controls}>
        <button style={styles.buttonDanger} onClick={resetCards}>
          Reset Selections
        </button>
      </div>
      <div style={styles.grid}>
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

// ============= MAIN SANDBOX =============
export default function CardVisibilitySandbox() {
  const [activeScene, setActiveScene] = useState(1);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const setTimeScale = useCardVisibilityStore((s) => s.actions.setTimeScale);
  const reset = useCardVisibilityStore((s) => s.reset);

  React.useEffect(() => {
    reset();
  }, [activeScene, reset]);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>Card Visibility Animation System</h1>

        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <strong>Animation Speed:</strong>
            <button style={styles.button} onClick={() => setTimeScale(0.5)}>
              0.5x
            </button>
            <button
              style={timeScale === 1 ? styles.buttonActive : styles.button}
              onClick={() => setTimeScale(1)}
            >
              1x
            </button>
            <button style={styles.button} onClick={() => setTimeScale(2)}>
              2x
            </button>
          </div>

          <div style={styles.controlGroup}>
            <strong>Scene:</strong>
            {[1, 2, 3].map((scene) => (
              <button
                key={scene}
                style={activeScene === scene ? styles.buttonActive : styles.button}
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

        <SwimlanesVisualizer />
      </div>
    </div>
  );
}
