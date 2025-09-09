// card-visibility-sandbox.tsx
import React, { memo, useCallback, useRef, useEffect, useState } from "react";
import { create } from "zustand";
import styles from "./card-visibility-sandbox.module.css";

// ============= TYPES =============
type VisualState = 
  | "hidden" 
  | "visible" 
  | "visible-colored" 
  | "visible-processing"  // When selected but no teamName yet
  | "visible-covered";    // When selected and has teamName

type GameEvent = 
  | "deal-in" 
  | "spymaster-reveal" 
  | "spymaster-hide" 
  | "start-processing"    // Triggered by selected: true
  | "cover-card";         // Triggered by teamName being set

type ViewMode = "normal" | "spymaster";

interface Card {
  word: string;
  teamName: "red" | "blue" | "neutral" | "assassin";
  selected: boolean;
}

interface TransitionContext {
  viewMode: ViewMode;
  card: Card;
}

interface AnimationTracker {
  cardId: string;
  elementName: string;
  status: "pending" | "running" | "finished";
  progress: number;
  event?: GameEvent;
  startTime?: number;
}

// ============= ANIMATION TYPES =============
interface AnimationDefinition {
  keyframes: Keyframe[];
  duration?: number;
  delay?: number | ((index: number) => number);
  easing?: string;
}

interface AnimationConfig {
  [event: string]: {
    [selector: string]: AnimationDefinition;
  };
}

// ============= ANIMATION CONFIG =============
const CARD_ANIMATIONS: AnimationConfig = {
  "deal-in": {
    ".card-container": {
      keyframes: [
        { opacity: "0", transform: "translateY(-50px) rotate(5deg) scale(0.9)" },
        { opacity: "1", transform: "translateY(0) rotate(0) scale(1)" },
      ],
      duration: 500,
      delay: (index) => index * 50,
      easing: "ease-out",
    },
    ".card-word": {
      keyframes: [
        { opacity: "0", transform: "scale(0.5)" },
        { opacity: "1", transform: "scale(1)" },
      ],
      duration: 300,
      delay: (index) => index * 50 + 200,
      easing: "ease-out",
    },
  },
  "spymaster-reveal": {
    ".card-word": {
      keyframes: [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.1)", filter: "brightness(1.2)" },
      ],
      duration: 300,
      delay: (index) => index * 20,
    },
    ".card-badge": {
      keyframes: [
        { opacity: "0", transform: "translateY(10px) scale(0.8)" },
        { opacity: "1", transform: "translateY(0) scale(1)" },
      ],
      duration: 400,
      delay: (index) => index * 20 + 100,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
  "spymaster-hide": {
    ".card-word": {
      keyframes: [
        { transform: "scale(1.1)", filter: "brightness(1.2)" },
        { transform: "scale(1)", filter: "brightness(1)" },
      ],
      duration: 200,
      easing: "ease-in",
    },
    ".card-badge": {
      keyframes: [
        { opacity: "1", transform: "translateY(0)" },
        { opacity: "0", transform: "translateY(10px)" },
      ],
      duration: 200,
      easing: "ease-in",
    },
  },
  
  "start-processing": {
    // Immediate strikethrough effect
    ".card-word": {
      keyframes: [
        { opacity: "1", textDecoration: "none", transform: "scale(1)" },
        { opacity: "0.5", textDecoration: "line-through", transform: "scale(0.95)" },
      ],
      duration: 300,
      easing: "ease-out",
    },
    // Subtle pulse on the container
    ".card-container": {
      keyframes: [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(0.98)", filter: "brightness(0.9)" },
      ],
      duration: 400,
      easing: "ease-in-out",
    },
    // Show processing spinner
    ".processing-spinner": {
      keyframes: [
        { opacity: "0", transform: "scale(0.5) rotate(0deg)" },
        { opacity: "1", transform: "scale(1) rotate(180deg)" },
      ],
      duration: 500,
      easing: "ease-out",
    },
  },

  "cover-card": {
    // Keep existing animations for base card elements
    ".card-container": {
      keyframes: [
        { transform: "rotateY(0deg) scale(1)" },
        { transform: "rotateY(90deg) scale(0.95)" },
        { transform: "rotateY(180deg) scale(1)" },
      ],
      duration: 600,
      easing: "ease-in-out",
    },
    ".card-word": {
      keyframes: [
        { opacity: "0.5", transform: "scale(0.95)" },  // Already faded from processing
        { opacity: "0", transform: "scale(0.8)" },
      ],
      duration: 300,
      easing: "ease-in",
    },
    ".processing-spinner": {
      keyframes: [
        { opacity: "1", transform: "scale(1) rotate(180deg)" },
        { opacity: "0", transform: "scale(0.5) rotate(360deg)" },
      ],
      duration: 300,
      easing: "ease-in",
    },
    // UPDATE THIS to match your actual coverCard animation:
    ".cover-card": {
      keyframes: [
        {
          transform: "translateX(-100vw) translateY(-100vh) rotate(-6deg)",
          opacity: "0",
        },
        {
          transform: "translateX(0) translateY(0) rotate(2deg)",
          opacity: "1",
        },
        {
          transform: "translateX(0) translateY(0) rotate(0)",
          opacity: "1",
        },
      ],
      duration: 600,
      easing: "ease-out",
    },
  },
};

// ============= STATE MACHINE =============
interface StateTransition {
  from: VisualState;
  to: VisualState;
  event: GameEvent;
  condition: (context: TransitionContext) => boolean;
}

const CARD_STATE_MACHINE: StateTransition[] = [
  // Existing transitions
  {
    from: "hidden",
    to: "visible",
    event: "deal-in",
    condition: () => true,
  },
  {
    from: "visible",
    to: "visible-colored",
    event: "spymaster-reveal",
    condition: (ctx) => ctx.viewMode === "spymaster" && !ctx.card.selected && !!ctx.card.teamName,
  },
  {
    from: "visible-colored",
    to: "visible",
    event: "spymaster-hide",
    condition: (ctx) => ctx.viewMode === "normal" && !ctx.card.selected,
  },
  
  // NEW: Processing transitions
  {
    from: "visible",
    to: "visible-processing",
    event: "start-processing",
    condition: (ctx) => ctx.card.selected && !ctx.card.teamName,
  },
  {
    from: "visible-colored",
    to: "visible-processing",
    event: "start-processing",
    condition: (ctx) => ctx.card.selected && !ctx.card.teamName,
  },
  
  // NEW: From processing to covered when teamName arrives
  {
    from: "visible-processing",
    to: "visible-covered",
    event: "cover-card",
    condition: (ctx) => ctx.card.selected && !!ctx.card.teamName,
  },
  
  // Direct to covered if somehow we have both immediately
  {
    from: "visible",
    to: "visible-covered",
    event: "cover-card",
    condition: (ctx) => ctx.card.selected && !!ctx.card.teamName,
  },
  {
    from: "visible-colored",
    to: "visible-covered",
    event: "cover-card",
    condition: (ctx) => ctx.card.selected && !!ctx.card.teamName,
  },
];

/**
 * Derives the target state and event based on current state and context
 */
function deriveTargetState(
  currentState: VisualState,
  context: TransitionContext,
): { targetState: VisualState; event: GameEvent | null } {
  const transition = CARD_STATE_MACHINE.find(
    (t) => t.from === currentState && t.condition(context),
  );

  if (transition) {
    return {
      targetState: transition.to,
      event: transition.event,
    };
  }

  return {
    targetState: currentState,
    event: null,
  };
}

// ============= MOCK ASYNC PROCESS =============
async function simulateCardGuess(word: string): Promise<{
  success: boolean;
  outcome: string;
  message: string;
  teamName: "red" | "blue" | "neutral" | "assassin";
}> {
  console.log(`🎯 Processing guess for: ${word}`);

  const delay = 500 + Math.random() * 1500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const rand = Math.random();
  if (rand < 0.4) {
    return {
      success: true,
      outcome: "CORRECT_TEAM_CARD",
      message: `✅ ${word} was your team's agent!`,
      teamName: "red",
    };
  } else if (rand < 0.6) {
    return {
      success: true,
      outcome: "OTHER_TEAM_CARD",
      message: `❌ ${word} was the enemy agent!`,
      teamName: "blue",
    };
  } else if (rand < 0.9) {
    return {
      success: true,
      outcome: "BYSTANDER_CARD",
      message: `🟨 ${word} was a bystander`,
      teamName: "neutral",
    };
  } else {
    return {
      success: true,
      outcome: "ASSASSIN_CARD",
      message: `☠️ ${word} was the assassin!`,
      teamName: "assassin",
    };
  }
}

// ============= CLEANER STORE =============
interface CardState {
  visualState: VisualState;
  transition?: {
    from: VisualState;
    to: VisualState;
    event: GameEvent;
    startedAt: number;
  };
}

interface CardVisibilityStore {
  // Core state
  cards: Map<string, CardState>;
  viewMode: ViewMode;
  animationTrackers: AnimationTracker[];
  timeScale: number;

  // Card operations
  initCard: (cardId: string, initialState: VisualState) => void;
  updateCardState: (cardId: string, state: VisualState) => void;
  startTransition: (cardId: string, from: VisualState, to: VisualState, event: GameEvent) => void;
  completeTransition: (cardId: string) => void;

  // View operations
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  // Getters
  getCard: (cardId: string) => CardState | undefined;

  // Animation tracking
  updateAnimationTracker: (tracker: AnimationTracker) => void;
  clearAnimationTrackers: (cardId: string) => void;
  setTimeScale: (scale: number) => void;

  // Utility
  reset: () => void;
}

const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  cards: new Map(),
  viewMode: "normal",
  animationTrackers: [],
  timeScale: 1,

  initCard: (cardId, initialState) => {
    set((state) => {
      if (state.cards.has(cardId)) return state;

      const newCards = new Map(state.cards);
      newCards.set(cardId, { visualState: initialState });
      return { cards: newCards };
    });
  },

  updateCardState: (cardId, visualState) => {
    set((state) => {
      const newCards = new Map(state.cards);
      const card = newCards.get(cardId);
      if (card) {
        newCards.set(cardId, { ...card, visualState });
      }
      return { cards: newCards };
    });
  },

  startTransition: (cardId, from, to, event) => {
    console.log(`🎬 Starting transition for ${cardId}: ${from} -> ${to} (${event})`);
    set((state) => {
      const newCards = new Map(state.cards);
      newCards.set(cardId, {
        visualState: from,
        transition: { from, to, event, startedAt: Date.now() },
      });
      return { cards: newCards };
    });
  },

  completeTransition: (cardId) => {
    const card = get().cards.get(cardId);
    if (!card?.transition) return;

    console.log(
      `✅ Completed transition for ${cardId}: ${card.transition.from} -> ${card.transition.to}`,
    );
    set((state) => {
      const newCards = new Map(state.cards);
      newCards.set(cardId, {
        visualState: card.transition!.to,
        transition: undefined,
      });
      return { cards: newCards };
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () =>
    set((state) => ({ viewMode: state.viewMode === "normal" ? "spymaster" : "normal" })),

  getCard: (cardId) => get().cards.get(cardId),

  updateAnimationTracker: (tracker) =>
    set((state) => ({
      animationTrackers: [
        ...state.animationTrackers.filter(
          (t) => !(t.cardId === tracker.cardId && t.elementName === tracker.elementName)
        ),
        tracker,
      ],
    })),

  clearAnimationTrackers: (cardId) =>
    set((state) => ({
      animationTrackers: state.animationTrackers.filter((t) => t.cardId !== cardId),
    })),

  setTimeScale: (scale) => set({ timeScale: scale }),

  reset: () => set({ cards: new Map(), viewMode: "normal", animationTrackers: [] }),
}));

// ============= ANIMATION CONTAINER =============
interface AnimationContainerProps {
  event: string | null;
  index?: number;
  onComplete?: () => void;
  animations: AnimationConfig;
  children: React.ReactNode;
  cardId: string;
}

const AnimationContainer: React.FC<AnimationContainerProps> = ({
  event,
  index = 0,
  onComplete,
  animations,
  children,
  cardId,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const updateTracker = useCardVisibilityStore((s) => s.updateAnimationTracker);

  useEffect(() => {
    if (!ref.current || !event) return;

    const eventConfig = animations[event];
    if (!eventConfig) return;

    // Cancel previous animations
    animationsRef.current.forEach((anim) => anim.cancel());
    animationsRef.current = [];

    const runningAnimations: Animation[] = [];
    
    // ADD A DEMO DELAY FOR PENDING STATE (200ms so it's visible)
    const PENDING_DELAY = 200;

    Object.entries(eventConfig).forEach(([selector, definition]) => {
      const targets = ref.current!.querySelectorAll<HTMLElement>(selector);

      targets.forEach((target) => {
        const delay =
          typeof definition.delay === "function" ? definition.delay(index) : definition.delay || 0;

        // Apply time scaling
        const scaledDuration = (definition.duration || 1000) * timeScale;
        const scaledDelay = delay * timeScale;

        // Track animation as PENDING immediately
        if (cardId) {
          updateTracker({
            cardId,
            elementName: selector,
            status: "pending",
            progress: 0,
            event: event as GameEvent,
            startTime: Date.now(),
          });
        }

        // ADD THE DEMO DELAY before starting animation
        setTimeout(() => {
          const animation = target.animate(definition.keyframes, {
            duration: scaledDuration,
            delay: scaledDelay,
            easing: definition.easing || "ease",
            fill: "forwards",
          });

          runningAnimations.push(animation);

          if (cardId) {
            // Mark as RUNNING when animation actually starts
            setTimeout(() => {
              updateTracker({
                cardId,
                elementName: selector,
                status: "running",
                progress: 0,
                event: event as GameEvent,
                startTime: Date.now(),
              });
            }, scaledDelay);

            const updateProgress = () => {
              if (animation.playState === "running" && animation.currentTime !== null) {
                const currentTimeMs = Number(animation.currentTime);
                const progress = Math.min(1, Math.max(0, currentTimeMs / scaledDuration));
                updateTracker({
                  cardId,
                  elementName: selector,
                  status: "running",
                  progress,
                  event: event as GameEvent,
                });
              }
            };

            const progressInterval = setInterval(updateProgress, 50);

            animation.finished.then(() => {
              clearInterval(progressInterval);
              updateTracker({
                cardId,
                elementName: selector,
                status: "finished",
                progress: 1,
                event: event as GameEvent,
              });
            }).catch(() => {
              clearInterval(progressInterval);
            });
          }
        }, PENDING_DELAY); // Use the demo delay here
      });
    });

    // Delay the completion tracking to account for pending delay
    setTimeout(() => {
      animationsRef.current = runningAnimations;

      if (onComplete && runningAnimations.length > 0) {
        const allFinished = runningAnimations.map((anim) =>
          anim.finished.catch(() => {
            /* cancelled is ok */
          }),
        );

        Promise.all(allFinished).then(onComplete);
      }
    }, PENDING_DELAY);

    return () => {
      animationsRef.current.forEach((anim) => anim.cancel());
    };
  }, [event, index, onComplete, animations, timeScale, updateTracker, cardId]);

  return <div ref={ref}>{children}</div>;
};

// ============= HOOKS =============
/**
 * Hook for managing card visibility state and transitions
 */
function useCardVisibility(card: Card, initialState: VisualState = "visible") {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const cardState = useCardVisibilityStore((state) => state.getCard(card.word));
  const initCard = useCardVisibilityStore((state) => state.initCard);
  const startTransition = useCardVisibilityStore((state) => state.startTransition);
  const completeTransition = useCardVisibilityStore((state) => state.completeTransition);

  // useEffect 1: Initialize card if needed
  // Why: Only runs once when card doesn't exist in store
  useEffect(() => {
    if (!cardState) {
      initCard(card.word, initialState);
    }
  }, [cardState, initCard, card.word, initialState]);

  const currentState = cardState?.visualState || initialState;
  const activeTransition = cardState?.transition;

  const context: TransitionContext = { viewMode, card };
  const { targetState, event } = deriveTargetState(currentState, context);

  // useEffect 2: Handle state transitions
  // Why: Runs when card state changes or target state changes
  // Moved out of render to avoid React warnings about setState during render
  useEffect(() => {
    const needsTransition = !activeTransition && currentState !== targetState && event;

    if (needsTransition && event) {
      console.log(`🔄 ${card.word}: ${currentState} -> ${targetState} (${event})`);
      startTransition(card.word, currentState, targetState, event);
    }
  }, [card.word, currentState, targetState, event, activeTransition, startTransition]);

  const handleComplete = useCallback(() => {
    completeTransition(card.word);
  }, [card.word, completeTransition]);

  return {
    state: currentState,
    targetState,
    isTransitioning: !!activeTransition,
    animationEvent: activeTransition?.event || null,
    completeTransition: handleComplete,
  };
}

// ============= COMPONENTS =============
const GameCard = memo<{
  card: Card;
  index: number;
  onClick: (word: string) => void;
  initialState?: VisualState;
}>(({ card, index, onClick, initialState = "hidden" }) => {
  const { state, animationEvent, completeTransition } = useCardVisibility(card, initialState);

  const handleClick = () => {
    if (!card.selected) {
      onClick(card.word);
    }
  };

  const cardClasses = [
    styles.cardWrapper,
    card.selected && styles.selected,
    state === "visible-colored" &&
      styles[`color${card.teamName.charAt(0).toUpperCase() + card.teamName.slice(1)}`],
    state === "visible-processing" && styles.processing,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimationContainer
      event={animationEvent}
      index={index}
      onComplete={completeTransition}
      animations={CARD_ANIMATIONS}
      cardId={card.word}
    >
      <div
        className={cardClasses}
        onClick={handleClick}
        data-state={state}
        data-team={card.teamName}
        data-card-id={card.word}
      >
        <div className={`${styles.cardWord} card-container`}>
          <span className="card-word">{card.word}</span>
        </div>

        {/* Show spinner during processing state */}
        {state === "visible-processing" && (
          <div className={`${styles.processingSpinner} processing-spinner`}>
            <div className={styles.spinner} />
          </div>
        )}

        <div className={`${styles.cardState} card-badge`}>
          {state === "visible-colored" && (
            <span>[{card.teamName}]</span>
          )}
        </div>

        {/* Cover card renders when we have teamName */}
        {card.selected && card.teamName && (
          <div
            className={`${styles.coverCard} cover-card ${
              card.teamName === "red"
                ? styles.coverRed
                : card.teamName === "blue"
                  ? styles.coverBlue
                  : card.teamName === "neutral"
                    ? styles.coverNeutral
                    : card.teamName === "assassin"
                      ? styles.coverAssassin
                      : ""
            }`}
          >
            <span className="cover-word">{card.word}</span>
            <span className="cover-team">{card.teamName.toUpperCase()}</span>
          </div>
        )}
      </div>
    </AnimationContainer>
  );
});

GameCard.displayName = "GameCard";

// ============= SWIMLANE VISUALIZER =============
const SwimLaneVisualizer = () => {
  const trackers = useCardVisibilityStore((s) => s.animationTrackers);

  const lanes = ["pending", "running", "finished"];
  const laneColors = {
    pending: "#ffaa00",
    running: "#00aaff",
    finished: "#00ff00",
  };

  const groupedByStatus = lanes.reduce(
    (acc, lane) => {
      acc[lane] = trackers.filter((t) => t.status === lane);
      return acc;
    },
    {} as Record<string, AnimationTracker[]>,
  );

  return (
    <div className={styles.swimlanes}>
      <h3 className={styles.swimlanesTitle}>Animation Swimlanes</h3>
      <div className={styles.swimlanesContainer}>
        {lanes.map((lane) => (
          <div key={lane} className={styles.swimlane}>
            <div 
              className={`${styles.swimlaneHeader} ${styles[lane]}`}
              style={{ backgroundColor: laneColors[lane as keyof typeof laneColors] }}
            >
              {lane.toUpperCase()} ({groupedByStatus[lane].length})
            </div>
            <div className={styles.swimlaneContent}>
              {groupedByStatus[lane].map((tracker) => (
                <div
                  key={`${tracker.cardId}-${tracker.elementName}`}
                  className={`${styles.swimlaneItem} ${tracker.status === "finished" ? styles.finished : ""}`}
                  style={{
                    transform: `translateX(${tracker.progress * 20}px)`,
                    transition: "transform 0.2s",
                    opacity: tracker.status === "finished" ? 0.6 : 1,
                  }}
                >
                  <div className={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                  <div className={styles.swimlaneItemElement}>{tracker.elementName}</div>
                  {tracker.event && (
                    <div className={styles.swimlaneItemEvent}>{tracker.event}</div>
                  )}
                  {tracker.status === "running" && (
                    <div className={styles.swimlaneProgress}>
                      <div
                        className={styles.swimlaneProgressBar}
                        style={{ 
                          width: `${tracker.progress * 100}%`,
                          backgroundColor: "#00aaff",
                          height: "4px",
                          borderRadius: "2px",
                          transition: "width 0.1s"
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============= MAIN DEMO =============
export default function CardAnimationSystem() {
  const [cards, setCards] = useState<Card[]>([
    { word: "AGENT", teamName: "red", selected: false },
    { word: "SPY", teamName: "blue", selected: false },
    { word: "CODE", teamName: "neutral", selected: false },
    { word: "SECRET", teamName: "red", selected: false },
    { word: "MISSION", teamName: "blue", selected: false },
    { word: "TARGET", teamName: "neutral", selected: false },
    { word: "CIPHER", teamName: "red", selected: false },
    { word: "INTEL", teamName: "assassin", selected: false },
    { word: "SHADOW", teamName: "blue", selected: false },
  ]);

  const [scene, setScene] = useState<"lobby" | "game" | "outcome">("lobby");

  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const toggleViewMode = useCardVisibilityStore((s) => s.toggleViewMode);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const setTimeScale = useCardVisibilityStore((s) => s.setTimeScale);
  const reset = useCardVisibilityStore((s) => s.reset);

  const handleCardClick = async (word: string) => {
    console.log(`\n========== CARD CLICK FLOW ==========`);
    console.log(`1️⃣ User clicked: ${word}`);
    
    // First update: mark as selected (triggers "start-processing")
    setCards((prev) =>
      prev.map((card) => 
        card.word === word 
          ? { ...card, selected: true }  // No teamName yet
          : card
      ),
    );

    // Simulate async work
    const result = await simulateCardGuess(word);
    console.log(`2️⃣ ${result.message}`);
    
    // Second update: add teamName (triggers "cover-card")
    setCards((prev) =>
      prev.map((card) => 
        card.word === word 
          ? { ...card, selected: true, teamName: result.teamName }
          : card
      ),
    );
  };

  const handleSceneChange = (newScene: typeof scene) => {
    console.log(`🎭 Scene change: ${scene} -> ${newScene}`);
    setScene(newScene);
  };

  const handleReset = () => {
    setCards((prev) => prev.map((card) => ({ ...card, selected: false })));
    reset();
    setScene("lobby");
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Animation System Demo</h1>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <strong>Scene:</strong>
            <button
              className={scene === "lobby" ? styles.buttonActive : styles.button}
              onClick={() => handleSceneChange("lobby")}
            >
              Lobby
            </button>
            <button
              className={scene === "game" ? styles.buttonActive : styles.button}
              onClick={() => handleSceneChange("game")}
            >
              Game
            </button>
            <button
              className={scene === "outcome" ? styles.buttonActive : styles.button}
              onClick={() => handleSceneChange("outcome")}
            >
              Outcome
            </button>
          </div>

          <div className={styles.controlGroup}>
            <strong>View:</strong>
            <button
              className={viewMode === "spymaster" ? styles.buttonActive : styles.button}
              onClick={toggleViewMode}
            >
              Toggle AR ({viewMode === "spymaster" ? "ON" : "OFF"})
            </button>
          </div>

          <div className={styles.controlGroup}>
            <strong>Speed:</strong>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={timeScale}
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
              style={{ width: "100px" }}
            />
            <span>{timeScale.toFixed(1)}x</span>
          </div>

          <button
            className={styles.buttonDanger}
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <div className={styles.grid}>
          {scene === "lobby" &&
            cards.map((card, index) => (
              <GameCard
                key={`${scene}-${card.word}`}
                card={card}
                index={index}
                onClick={handleCardClick}
                initialState="hidden"
              />
            ))}

          {scene === "game" &&
            cards.map((card, index) => (
              <GameCard
                key={`${scene}-${card.word}`}
                card={card}
                index={index}
                onClick={handleCardClick}
                initialState="visible"
              />
            ))}

          {scene === "outcome" &&
            cards.map((card, index) => (
              <GameCard
                key={`${scene}-${card.word}`}
                card={card}
                index={index}
                onClick={() => {}}
                initialState="visible"
              />
            ))}
        </div>

        {/* Add swimlanes at the bottom */}
        <SwimLaneVisualizer />
      </div>
    </div>
  );
}
