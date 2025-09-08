// card-visibility-sandbox.tsx
import React, {
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import { create } from "zustand";
import styles from "./card-visibility-sandbox.module.css";

// ============= TYPES =============
type VisualState = "hidden" | "visible" | "visible-colored" | "visible-covered";
type GameEvent = "deal-in" | "spymaster-reveal" | "spymaster-hide" | "cover-card";
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
  "cover-card": {
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
        { opacity: "1", transform: "scale(1)" },
        { opacity: "0", transform: "scale(0.8)" },
      ],
      duration: 300,
      easing: "ease-in",
    },
    ".card-badge": {
      keyframes: [
        { opacity: "0", transform: "scale(0)" },
        { opacity: "1", transform: "scale(1.2)" },
        { opacity: "1", transform: "scale(1)" },
      ],
      duration: 600,
      delay: 300,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    ".cover-card": {
      keyframes: [
        { opacity: "0", transform: "translateY(-100%) rotate(-10deg) scale(0.8)" },
        { opacity: "1", transform: "translateY(0) rotate(0) scale(1)" },
      ],
      duration: 600,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
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

  // Utility
  reset: () => void;
}

const useCardVisibilityStore = create<CardVisibilityStore>((set, get) => ({
  cards: new Map(),
  viewMode: "normal",

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

  reset: () => set({ cards: new Map(), viewMode: "normal" }),
}));

// ============= ANIMATION CONTAINER =============
interface AnimationContainerProps {
  event: string | null;
  index?: number;
  onComplete?: () => void;
  animations: AnimationConfig;
  children: React.ReactNode;
}

const AnimationContainer: React.FC<AnimationContainerProps> = ({
  event,
  index = 0,
  onComplete,
  animations,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    if (!ref.current || !event) return;

    const eventConfig = animations[event];
    if (!eventConfig) return;

    // Cancel previous animations
    animationsRef.current.forEach((anim) => anim.cancel());
    animationsRef.current = [];

    const runningAnimations: Animation[] = [];

    Object.entries(eventConfig).forEach(([selector, definition]) => {
      const targets = ref.current!.querySelectorAll<HTMLElement>(selector);

      targets.forEach((target) => {
        const delay =
          typeof definition.delay === "function" ? definition.delay(index) : definition.delay || 0;

        const animation = target.animate(definition.keyframes, {
          duration: definition.duration || 1000,
          delay,
          easing: definition.easing || "ease",
          fill: "forwards",
        });

        runningAnimations.push(animation);
      });
    });

    animationsRef.current = runningAnimations;

    if (onComplete && runningAnimations.length > 0) {
      const allFinished = runningAnimations.map((anim) =>
        anim.finished.catch(() => {
          /* cancelled is ok */
        }),
      );

      Promise.all(allFinished).then(onComplete);
    }

    return () => {
      animationsRef.current.forEach((anim) => anim.cancel());
    };
  }, [event, index, onComplete, animations]);

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
  isPending: boolean;
  pendingWord?: string;
  initialState?: VisualState;
}>(({ card, index, onClick, isPending, pendingWord, initialState = "hidden" }) => {
  const { state, animationEvent, completeTransition } = useCardVisibility(card, initialState);
  const isThisCardPending = isPending && pendingWord === card.word;

  const handleClick = () => {
    if (!card.selected && !isPending) {
      onClick(card.word);
    }
  };

  const cardClasses = [
    styles.cardWrapper,
    card.selected && styles.selected,
    state === "visible-colored" &&
      styles[`color${card.teamName.charAt(0).toUpperCase() + card.teamName.slice(1)}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimationContainer
      event={animationEvent}
      index={index}
      onComplete={completeTransition}
      animations={CARD_ANIMATIONS}
    >
      <div
        className={cardClasses}
        onClick={handleClick}
        data-state={state}
        data-team={card.teamName}
      >
        <div className={`${styles.cardWord} card-container`}>
          <span className="card-word">{card.word}</span>
        </div>

        <div className={`${styles.cardState} card-badge`}>
          {state === "visible-covered" ? (
            <span>
              {card.teamName === "assassin" ? "☠️ ASSASSIN" : card.teamName.toUpperCase()}
            </span>
          ) : state === "visible-colored" ? (
            <span>[{card.teamName}]</span>
          ) : null}
        </div>

        {/* Cover card overlay */}
        {state === "visible-covered" && (
          <div className={`${styles.coverCard} cover-card ${
            card.teamName === 'red' ? styles.coverRed :
            card.teamName === 'blue' ? styles.coverBlue :
            card.teamName === 'neutral' ? styles.coverNeutral :
            card.teamName === 'assassin' ? styles.coverAssassin :
            ''
          }`}>
            <span className="cover-word">{card.word}</span>
            <span className="cover-team">{card.teamName.toUpperCase()}</span>
          </div>
        )}

        {isThisCardPending && (
          <div className={styles.pendingOverlay}>
            <div className={styles.spinner} />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </AnimationContainer>
  );
});

GameCard.displayName = "GameCard";

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
              disabled={pendingGuess?.status === "pending"}
            >
              Lobby
            </button>
            <button
              className={scene === "game" ? styles.buttonActive : styles.button}
              onClick={() => handleSceneChange("game")}
              disabled={pendingGuess?.status === "pending"}
            >
              Game
            </button>
            <button
              className={scene === "outcome" ? styles.buttonActive : styles.button}
              onClick={() => handleSceneChange("outcome")}
              disabled={pendingGuess?.status === "pending"}
            >
              Outcome
            </button>
          </div>

          <div className={styles.controlGroup}>
            <strong>View:</strong>
            <button
              className={viewMode === "spymaster" ? styles.buttonActive : styles.button}
              onClick={toggleViewMode}
              disabled={pendingGuess?.status === "pending"}
            >
              Toggle AR ({viewMode === "spymaster" ? "ON" : "OFF"})
            </button>
          </div>

          <button
            className={styles.buttonDanger}
            onClick={handleReset}
            disabled={pendingGuess?.status === "pending"}
          >
            Reset
          </button>
        </div>

        {pendingGuess && (
          <div
            className={
              pendingGuess.status === "pending" ? styles.pendingMessage : styles.successMessage
            }
          >
            {pendingGuess.status === "pending" && (
              <>
                <div className={styles.spinner} />
                <span>Processing: {pendingGuess.word}...</span>
              </>
            )}
            {pendingGuess.status === "success" && <span>{pendingGuess.message}</span>}
          </div>
        )}

        <div className={styles.grid}>
          {scene === "lobby" &&
            cards.map((card, index) => (
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

          {scene === "game" &&
            cards.map((card, index) => (
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

          {scene === "outcome" &&
            cards.map((card, index) => (
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
    </div>
  );
}
