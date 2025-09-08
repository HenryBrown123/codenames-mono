import React, { memo, useCallback, useRef, useEffect, useState, useMemo } from "react";
import { create } from "zustand";

// ============= TYPES =============
type VisualState = "hidden" | "visible" | "visible-colored" | "visible-covered";
type GameEvent = "deal-in" | "spymaster-reveal" | "spymaster-hide" | "cover-card";
type ViewMode = "normal" | "spymaster";

interface Card {
  word: string;
  teamName: "red" | "blue" | "neutral" | "assassin";
  selected: boolean;
}

interface AnimationDefinition {
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
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

// ============= STATE MACHINE =============
interface StateTransition {
  from: VisualState;
  to: VisualState;
  event: GameEvent;
  condition: (context: TransitionContext) => boolean;
}

const CARD_STATE_MACHINE: StateTransition[] = [
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
  {
    from: "visible",
    to: "visible-covered",
    event: "cover-card",
    condition: (ctx) => ctx.card.selected,
  },
  {
    from: "visible-colored",
    to: "visible-covered",
    event: "cover-card",
    condition: (ctx) => ctx.card.selected,
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
}> {
  console.log(`🎯 Processing guess for: ${word}`);

  const delay = 500 + Math.random() * 1500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const rand = Math.random();
  if (rand < 0.6) {
    return {
      success: true,
      outcome: "CORRECT_TEAM_CARD",
      message: `✅ ${word} was your team's agent!`,
    };
  } else if (rand < 0.8) {
    return {
      success: true,
      outcome: "OTHER_TEAM_CARD",
      message: `❌ ${word} was the enemy agent!`,
    };
  } else {
    return {
      success: true,
      outcome: "BYSTANDER_CARD",
      message: `🟨 ${word} was a bystander`,
    };
  }
}

// ============= STORE =============
interface CardVisibilityStore {
  displayStates: Map<string, VisualState>;
  transitions: Map<
    string,
    {
      from: VisualState;
      to: VisualState;
      event: GameEvent;
      startedAt: number;
    }
  >;
  viewMode: ViewMode;
  animationTrackers: AnimationTracker[];
  timeScale: number;

  initCard: (cardId: string, initialState: VisualState) => void;
  startTransition: (cardId: string, from: VisualState, to: VisualState, event: GameEvent) => void;
  completeTransition: (cardId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  reset: () => void;
  updateAnimationTracker: (tracker: AnimationTracker) => void;
  clearAnimationTrackers: (cardId: string) => void;
  setTimeScale: (scale: number) => void;
  getDisplayState: (cardId: string) => VisualState | undefined;
  getTransition: (
    cardId: string,
  ) => { from: VisualState; to: VisualState; event: GameEvent } | undefined;
}

const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  displayStates: new Map(),
  transitions: new Map(),
  viewMode: "normal",
  animationTrackers: [],
  timeScale: 1,

  initCard: (cardId, initialState) => {
    const current = get().displayStates.get(cardId);
    if (!current) {
      set((state) => ({
        displayStates: new Map(state.displayStates).set(cardId, initialState),
      }));
    }
  },

  startTransition: (cardId, from, to, event) => {
    console.log(`🎬 Starting transition for ${cardId}: ${from} -> ${to} (${event})`);
    set((state) => ({
      transitions: new Map(state.transitions).set(cardId, {
        from,
        to,
        event,
        startedAt: Date.now(),
      }),
    }));
  },

  completeTransition: (cardId) => {
    const transition = get().transitions.get(cardId);
    if (!transition) return;

    console.log(`✅ Completed transition for ${cardId}: ${transition.from} -> ${transition.to}`);
    set((state) => {
      const newDisplayStates = new Map(state.displayStates).set(cardId, transition.to);
      const newTransitions = new Map(state.transitions);
      newTransitions.delete(cardId);

      return {
        displayStates: newDisplayStates,
        transitions: newTransitions,
      };
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "normal" ? "spymaster" : "normal",
    })),

  reset: () =>
    set({
      displayStates: new Map(),
      transitions: new Map(),
      viewMode: "normal",
      animationTrackers: [],
    }),

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

  setTimeScale: (scale) => set({ timeScale: scale }),
  getDisplayState: (cardId) => get().displayStates.get(cardId),
  getTransition: (cardId) => get().transitions.get(cardId),
}));

// ============= HOOKS =============
/**
 * Hook for managing card visibility state and transitions
 */
function useCardVisibility(card: Card, initialState: VisualState = "visible") {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const displayState = useCardVisibilityStore((state) => state.getDisplayState(card.word));
  const activeTransition = useCardVisibilityStore((state) => state.getTransition(card.word));
  const initCard = useCardVisibilityStore((state) => state.initCard);
  const startTransition = useCardVisibilityStore((state) => state.startTransition);
  const completeTransition = useCardVisibilityStore((state) => state.completeTransition);
  const updateAnimationTracker = useCardVisibilityStore((state) => state.updateAnimationTracker);

  // Initialize card if needed
  useEffect(() => {
    if (!displayState) {
      initCard(card.word, initialState);
    }
  }, [displayState, initCard, card.word, initialState]);

  const context: TransitionContext = { viewMode, card };
  const { targetState, event } = deriveTargetState(displayState || initialState, context);

  // Handle transitions in useEffect to avoid render-phase updates
  useEffect(() => {
    const needsTransition = !activeTransition && displayState && displayState !== targetState && event;
    
    if (needsTransition && event) {
      console.log(`🔄 ${card.word}: ${displayState} -> ${targetState} (${event})`);

      // Update trackers for all elements
      ["container", "word", "badge"].forEach((elementName) => {
        updateAnimationTracker({
          cardId: card.word,
          elementName,
          status: "pending",
          progress: 0,
          event,
          startTime: Date.now(),
        });
      });
      
      startTransition(card.word, displayState, targetState, event);
    }
  }, [card.word, displayState, targetState, event, activeTransition, updateAnimationTracker, startTransition]);

  const handleComplete = useCallback(() => {
    completeTransition(card.word);
  }, [card.word, completeTransition]);

  return {
    state: displayState || initialState,
    targetState,
    isTransitioning: !!activeTransition,
    animationEvent: activeTransition?.event || null,
    completeTransition: handleComplete,
  };
}

interface AnimationElement {
  name: string;
  ref: (node: HTMLElement | null) => void;
  animations: Partial<Record<GameEvent, AnimationDefinition>>;
}

/**
 * Multi-element animation orchestration hook
 */
function useMultiElementAnimation({
  cardId,
  animationEvent,
  onComplete,
  elements,
  timeScale = 1,
}: {
  cardId: string;
  animationEvent: GameEvent | null;
  onComplete: () => void;
  elements: AnimationElement[];
  timeScale?: number;
}) {
  const updateTracker = useCardVisibilityStore((s) => s.updateAnimationTracker);
  const clearTrackers = useCardVisibilityStore((s) => s.clearAnimationTrackers);
  const elementRefs = useRef<Map<string, HTMLElement>>(new Map());
  const animationRefs = useRef<Map<string, Animation>>(new Map());
  const completedCountRef = useRef(0);
  const totalAnimationsRef = useRef(0);

  useEffect(() => {
    if (!animationEvent) {
      clearTrackers(cardId);
      return;
    }

    // Reset counters
    completedCountRef.current = 0;
    totalAnimationsRef.current = 0;
    const activeAnimations: { name: string; animation: Animation }[] = [];

    // Count actual animations that will run
    elements.forEach((element) => {
      const node = elementRefs.current.get(element.name);
      const animDef = element.animations[animationEvent];
      if (node && animDef) {
        totalAnimationsRef.current++;
      }
    });

    elements.forEach((element) => {
      const node = elementRefs.current.get(element.name);
      if (!node) return;

      const animDef = element.animations[animationEvent];
      if (!animDef) return;

      const existing = animationRefs.current.get(element.name);
      existing?.cancel();

      try {
        const scaledOptions: KeyframeAnimationOptions = {
          ...animDef.options,
          duration:
            typeof animDef.options?.duration === "number"
              ? animDef.options.duration * timeScale
              : 1000 * timeScale,
          delay: typeof animDef.options?.delay === "number" ? animDef.options.delay * timeScale : 0,
        };

        const animation = node.animate(animDef.keyframes, { fill: "forwards", ...scaledOptions });

        animationRefs.current.set(element.name, animation);
        activeAnimations.push({ name: element.name, animation });

        updateTracker({
          cardId,
          elementName: element.name,
          status: "running",
          progress: 0,
          event: animationEvent,
          startTime: Date.now(),
        });

        const updateProgress = () => {
          if (
            animation.playState === "running" &&
            animation.currentTime !== null &&
            animation.effect?.getComputedTiming()
          ) {
            const timing = animation.effect.getComputedTiming();
            const duration = typeof timing.duration === "number" ? timing.duration : 0;
            const currentTime =
              typeof animation.currentTime === "number" ? animation.currentTime : 0;
            const progress = duration > 0 ? currentTime / duration : 0;

            updateTracker({
              cardId,
              elementName: element.name,
              status: "running",
              progress: Math.min(1, Math.max(0, progress)),
              event: animationEvent,
              startTime: Date.now() - currentTime,
            });
          }
        };

        const progressInterval = setInterval(updateProgress, 50);

        animation.finished
          .then(() => {
            clearInterval(progressInterval);
            completedCountRef.current++;

            updateTracker({
              cardId,
              elementName: element.name,
              status: "finished",
              progress: 1,
              event: animationEvent,
            });

            console.log(
              `  ${element.name} complete (${completedCountRef.current}/${totalAnimationsRef.current})`,
            );

            if (completedCountRef.current === totalAnimationsRef.current) {
              console.log(`  All animations complete for ${cardId}!`);
              setTimeout(() => clearTrackers(cardId), 2000);
              onComplete();
            }
          })
          .catch(() => {
            clearInterval(progressInterval);
            completedCountRef.current++;
            if (completedCountRef.current === totalAnimationsRef.current) {
              onComplete();
            }
          });
      } catch (error) {
        console.warn(`Failed to animate ${element.name}:`, error);
        completedCountRef.current++;
        if (completedCountRef.current === totalAnimationsRef.current) {
          onComplete();
        }
      }
    });

    return () => {
      activeAnimations.forEach(({ animation }) => animation.cancel());
      animationRefs.current.clear();
    };
  }, [animationEvent, onComplete, elements, cardId, timeScale, updateTracker, clearTrackers]);

  return elements.map((element) => ({
    name: element.name,
    ref: (node: HTMLElement | null) => {
      if (node) {
        elementRefs.current.set(element.name, node);
      } else {
        elementRefs.current.delete(element.name);
      }
    },
  }));
}

// ============= COMPONENTS =============
const GameCard = memo<{
  card: Card;
  index: number;
  onClick: (word: string) => void;
  isPending: boolean;
  pendingWord?: string;
  initialState?: VisualState;
}>(({ card, index, onClick, isPending, pendingWord, initialState = "hidden" }) => {
  const { state, animationEvent, completeTransition } =
    useCardVisibility(card, initialState);

  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const isThisCardPending = isPending && pendingWord === card.word;

  const animationElements: AnimationElement[] = useMemo(() => {
    const baseDelay = index * 50;

    return [
      {
        name: "container",
        ref: () => {},
        animations: {
          "deal-in": {
            keyframes: [
              { opacity: "0", transform: "translateY(-50px) rotate(5deg) scale(0.9)" },
              { opacity: "1", transform: "translateY(0) rotate(0) scale(1)" },
            ],
            options: { duration: 500, delay: baseDelay, easing: "ease-out" },
          },
          "cover-card": {
            keyframes: [
              { transform: "rotateY(0deg) scale(1)" },
              { transform: "rotateY(90deg) scale(0.95)" },
              { transform: "rotateY(180deg) scale(1)" },
            ],
            options: { duration: 600, easing: "ease-in-out" },
          },
        },
      },
      {
        name: "word",
        ref: () => {},
        animations: {
          "deal-in": {
            keyframes: [
              { opacity: "0", transform: "scale(0.5)" },
              { opacity: "1", transform: "scale(1)" },
            ],
            options: { duration: 300, delay: baseDelay + 200, easing: "ease-out" },
          },
          "spymaster-reveal": {
            keyframes: [
              { transform: "scale(1)", filter: "brightness(1)" },
              { transform: "scale(1.1)", filter: "brightness(1.2)" },
            ],
            options: { duration: 300, delay: index * 20, easing: "ease-out" },
          },
          "spymaster-hide": {
            keyframes: [
              { transform: "scale(1.1)", filter: "brightness(1.2)" },
              { transform: "scale(1)", filter: "brightness(1)" },
            ],
            options: { duration: 200, easing: "ease-in" },
          },
          "cover-card": {
            keyframes: [
              { opacity: "1", transform: "scale(1)" },
              { opacity: "0", transform: "scale(0.8)" },
            ],
            options: { duration: 300, easing: "ease-in" },
          },
        },
      },
      {
        name: "badge",
        ref: () => {},
        animations: {
          "spymaster-reveal": {
            keyframes: [
              { opacity: "0", transform: "translateY(10px) scale(0.8)" },
              { opacity: "1", transform: "translateY(0) scale(1)" },
            ],
            options: {
              duration: 400,
              delay: index * 20 + 100,
              easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            },
          },
          "spymaster-hide": {
            keyframes: [
              { opacity: "1", transform: "translateY(0) scale(1)" },
              { opacity: "0", transform: "translateY(10px) scale(0.8)" },
            ],
            options: { duration: 200, easing: "ease-in" },
          },
          "cover-card": {
            keyframes: [
              { opacity: "0", transform: "scale(0)" },
              { opacity: "1", transform: "scale(1.2)" },
              { opacity: "1", transform: "scale(1)" },
            ],
            options: { duration: 600, delay: 300, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
          },
        },
      },
    ];
  }, [index]);

  const elementRefs = useMultiElementAnimation({
    cardId: card.word,
    animationEvent,
    onComplete: completeTransition,
    elements: animationElements,
    timeScale,
  });

  const cardStyles: React.CSSProperties = {
    position: "relative" as const,
    padding: "1.5rem",
    borderRadius: "8px",
    border: "2px solid #333",
    background:
      state === "visible-colored"
        ? card.teamName === "red"
          ? "#ff4444"
          : card.teamName === "blue"
            ? "#4444ff"
            : card.teamName === "assassin"
              ? "#000"
              : "#888"
        : state === "visible-covered"
          ? "#444"
          : "#f0f0f0",
    color: state === "visible-colored" || state === "visible-covered" ? "#fff" : "#333",
    cursor: !card.selected && !isPending ? "pointer" : "default",
    opacity: isThisCardPending ? 0.6 : 1,
    transition: "background 0.3s, color 0.3s",
    userSelect: "none" as const,
  };

  const handleClick = () => {
    if (!card.selected && !isPending) {
      onClick(card.word);
    }
  };

  return (
    <div
      ref={elementRefs[0].ref}
      style={cardStyles}
      onClick={handleClick}
      data-state={state}
      data-team={card.teamName}
    >
      <div
        ref={elementRefs[1].ref}
        style={{ fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" as const }}
      >
        {card.word}
      </div>

      <div
        ref={elementRefs[2].ref}
        style={{
          display: state === "visible-colored" || state === "visible-covered" ? "flex" : "none",
          justifyContent: "center",
          marginTop: "0.5rem",
          fontSize: "0.9rem",
          opacity: 0.8,
        }}
      >
        {state === "visible-covered" ? (
          <span>{card.teamName === "assassin" ? "☠️ ASSASSIN" : card.teamName.toUpperCase()}</span>
        ) : (
          <span>[{card.teamName}]</span>
        )}
      </div>

      {isThisCardPending && (
        <div
          style={{
            position: "absolute" as const,
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "3px solid #fff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ marginLeft: "0.5rem", color: "#fff" }}>Processing...</span>
        </div>
      )}
    </div>
  );
});

GameCard.displayName = "GameCard";

/**
 * Swimlane visualization component for animation tracking
 */
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
    <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", marginTop: "2rem" }}>
      <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Animation Swimlanes</h3>
      <div style={{ display: "flex", gap: "1rem" }}>
        {lanes.map((lane) => (
          <div key={lane} style={{ flex: 1 }}>
            <div
              style={{
                backgroundColor: laneColors[lane as keyof typeof laneColors],
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "4px 4px 0 0",
                textAlign: "center" as const,
                fontWeight: "bold",
              }}
            >
              {lane.toUpperCase()} ({groupedByStatus[lane].length})
            </div>
            <div
              style={{
                minHeight: "200px",
                background: "#2a2a2a",
                padding: "0.5rem",
                borderRadius: "0 0 4px 4px",
              }}
            >
              {groupedByStatus[lane].map((tracker) => (
                <div
                  key={`${tracker.cardId}-${tracker.elementName}`}
                  style={{
                    background: "#333",
                    padding: "0.5rem",
                    marginBottom: "0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    color: "#fff",
                    opacity: tracker.status === "finished" ? 0.6 : 1,
                    transform: `translateX(${tracker.progress * 20}px)`,
                    transition: "transform 0.2s",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{tracker.cardId}</div>
                  <div style={{ opacity: 0.8 }}>{tracker.elementName}</div>
                  {tracker.event && (
                    <div style={{ opacity: 0.6, fontSize: "0.7rem" }}>{tracker.event}</div>
                  )}
                  {tracker.status === "running" && (
                    <div
                      style={{
                        height: "4px",
                        background: "#555",
                        borderRadius: "2px",
                        marginTop: "0.25rem",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "#00aaff",
                          width: `${tracker.progress * 100}%`,
                          transition: "width 0.1s",
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
  const [pendingGuess, setPendingGuess] = useState<{
    word: string;
    status: "pending" | "success";
    message?: string;
  } | null>(null);

  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const toggleViewMode = useCardVisibilityStore((s) => s.toggleViewMode);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const setTimeScale = useCardVisibilityStore((s) => s.setTimeScale);
  const reset = useCardVisibilityStore((s) => s.reset);

  const handleCardClick = async (word: string) => {
    console.log(`\n========== CARD CLICK FLOW ==========`);
    console.log(`1️⃣ User clicked: ${word}`);

    setPendingGuess({ word, status: "pending" });

    const result = await simulateCardGuess(word);

    console.log(`2️⃣ ${result.message}`);

    setCards((prev) =>
      prev.map((card) => (card.word === word ? { ...card, selected: true } : card)),
    );

    setPendingGuess({
      word,
      status: "success",
      message: result.message,
    });

    setTimeout(() => setPendingGuess(null), 2000);
  };

  const handleSceneChange = (newScene: typeof scene) => {
    console.log(`🎭 Scene change: ${scene} -> ${newScene}`);
    setScene(newScene);
  };

  const handleReset = () => {
    setCards((prev) => prev.map((card) => ({ ...card, selected: false })));
    setPendingGuess(null);
    reset();
    setScene("lobby");
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "#00aaff",
    border: "1px solid #00aaff",
  };

  return (
    <div style={{ padding: "2rem", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "2rem", fontSize: "2rem" }}>Animation System with Swimlanes</h1>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            marginBottom: "2rem",
            flexWrap: "wrap" as const,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <strong>Scene:</strong>
            <button
              style={scene === "lobby" ? activeButtonStyle : buttonStyle}
              onClick={() => handleSceneChange("lobby")}
              disabled={pendingGuess?.status === "pending"}
            >
              Lobby
            </button>
            <button
              style={scene === "game" ? activeButtonStyle : buttonStyle}
              onClick={() => handleSceneChange("game")}
              disabled={pendingGuess?.status === "pending"}
            >
              Game
            </button>
            <button
              style={scene === "outcome" ? activeButtonStyle : buttonStyle}
              onClick={() => handleSceneChange("outcome")}
              disabled={pendingGuess?.status === "pending"}
            >
              Outcome
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <strong>View:</strong>
            <button
              style={viewMode === "spymaster" ? activeButtonStyle : buttonStyle}
              onClick={toggleViewMode}
              disabled={pendingGuess?.status === "pending"}
            >
              Toggle AR ({viewMode === "spymaster" ? "ON" : "OFF"})
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <strong>Time:</strong>
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
            style={{ ...buttonStyle, background: "#ff4444", borderColor: "#ff4444" }}
            onClick={handleReset}
            disabled={pendingGuess?.status === "pending"}
          >
            Reset
          </button>
        </div>

        {pendingGuess && (
          <div
            style={{
              padding: "1rem",
              background: pendingGuess.status === "pending" ? "#ffaa00" : "#00ff00",
              color: "#000",
              borderRadius: "4px",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {pendingGuess.status === "pending" && (
              <>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "3px solid #000",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span>Processing: {pendingGuess.word}...</span>
              </>
            )}
            {pendingGuess.status === "success" && <span>{pendingGuess.message}</span>}
          </div>
        )}

        <div>
          {scene === "lobby" && (
            <div>
              <h2 style={{ marginBottom: "1rem" }}>Lobby - Cards Dealing In</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {cards.map((card, index) => (
                  <GameCard
                    key={`${scene}-${card.word}`}
                    card={card}
                    index={index}
                    onClick={handleCardClick}
                    isPending={pendingGuess?.status === "pending" || false}
                    pendingWord={pendingGuess?.word}
                    initialState="hidden"
                  />
                ))}
              </div>
            </div>
          )}

          {scene === "game" && (
            <div>
              <h2 style={{ marginBottom: "1rem" }}>Game - Interactive</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {cards.map((card, index) => (
                  <GameCard
                    key={`${scene}-${card.word}`}
                    card={card}
                    index={index}
                    onClick={handleCardClick}
                    isPending={pendingGuess?.status === "pending" || false}
                    pendingWord={pendingGuess?.word}
                    initialState="visible"
                  />
                ))}
              </div>
            </div>
          )}

          {scene === "outcome" && (
            <div>
              <h2 style={{ marginBottom: "1rem" }}>Outcome</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {cards.map((card, index) => (
                  <GameCard
                    key={`${scene}-${card.word}`}
                    card={card}
                    index={index}
                    onClick={() => {}}
                    isPending={false}
                    initialState="visible"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <SwimLaneVisualizer />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
