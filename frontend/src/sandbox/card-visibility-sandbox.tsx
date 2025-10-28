import React, { useState, useMemo, useCallback, useRef, useLayoutEffect, Activity } from "react";
import { AnimationEngineProvider, useAnimationRegistration } from "../gameplay/animations";
import { DevToolsPanel } from "../gameplay/animations/animation-devtools";
import { ViewModeProvider, useViewMode } from "../gameplay/game-board/view-mode";
import type { GameEvent } from "./sandbox-events.types";
import styles from "./card-visibility-sandbox.module.css";

// Mock events state (simulates React Query in real app)
function useGameplayEvents() {
  const [events, setEvents] = useState<GameEvent[]>([]);

  const addEvent = useCallback((type: string, cardId?: string) => {
    const event: GameEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      cardId,
    };
    setEvents((prev) => [...prev, event]);
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, addEvent, clearEvents };
}

// Hook to get next card event (same logic we designed)
function useCardEvent(events: GameEvent[], cardId: string): string | null {
  const lastProcessedIdRef = useRef<string | null>(null);

  return useMemo(() => {
    if (!events?.length) return null;

    const nextEvent = events.find((e) => {
      if (lastProcessedIdRef.current && e.id <= lastProcessedIdRef.current) {
        return false;
      }

      if (e.cardId && e.cardId !== cardId) {
        return false;
      }

      return true;
    });

    if (!nextEvent) return null;

    lastProcessedIdRef.current = nextEvent.id;
    return nextEvent.type;
  }, [events, cardId]);
}

interface SandboxCardProps {
  card: {
    word: string;
    teamName: string;
    selected: boolean;
  };
  index: number;
  events: GameEvent[];
  onSelect?: () => void;
}

const SandboxCard: React.FC<SandboxCardProps> = ({ card, index, events, onSelect }) => {
  const { viewMode } = useViewMode();

  const entityContext = useMemo(
    () => ({
      teamName: card.teamName,
      selected: card.selected,
      viewMode,
      index,
    }),
    [card.teamName, card.selected, viewMode, index],
  );

  // Get next event from event log (call BEFORE useAnimationRegistration)
  const nextEvent = useCardEvent(events, card.word);
  console.log("Card event found :", nextEvent);
  const { createAnimationRef, triggerTransition, isAnimating, currentAnimation } = useAnimationRegistration(
    card.word,
    entityContext,
    {
      entryTransition: nextEvent === "deal" ? "deal" : undefined,
      onComplete: (event) => {
        console.log(`[${card.word}] Animation completed: ${event}`);
      },
    },
  );

  // Trigger animations when nextEvent changes (excluding "deal" which is handled by entryTransition)
  const lastProcessedEventRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!nextEvent || nextEvent === "deal" || nextEvent === lastProcessedEventRef.current) {
      return;
    }

    console.log(`[${card.word}] Triggering animation: ${nextEvent}`);
    triggerTransition(nextEvent);
    lastProcessedEventRef.current = nextEvent;
  }, [nextEvent, triggerTransition, card.word]);

  // Determine overlay visibility
  const shouldShowOverlay =
    (viewMode === "spymaster" && !card.selected && !isAnimating) ||
    currentAnimation === "hide_colors";

  const cardAnimations = {
    deal: {
      keyframes: [
        {
          transform: "translateY(-100vh) rotate(-15deg)",
          opacity: 0,
        },
        {
          transform: "translateY(0) rotate(0deg)",
          opacity: 1,
        },
      ],
      options: {
        duration: 800,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "both" as FillMode,
      },
    },
    select: {
      keyframes: [
        { transform: "rotateY(0deg)" },
        { transform: "rotateY(90deg)", offset: 0.5 },
        { transform: "rotateY(180deg)" },
      ],
      options: {
        duration: 600,
        easing: "ease-in-out",
        fill: "both" as FillMode,
      },
    },
    reset: {
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
      options: {
        duration: 300,
        easing: "ease-out",
        fill: "both" as FillMode,
      },
    },
  };

  const overlayAnimations = {
    reveal_colors: {
      keyframes: [
        { opacity: "0", transform: "scale(0.8) translateY(-10px)" },
        { opacity: "1", transform: "scale(1) translateY(0)" },
      ],
      options: {
        duration: 400,
        delay: 100,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "forwards" as FillMode,
      },
    },
    hide_colors: {
      keyframes: [
        { opacity: "1", transform: "scale(1)" },
        { opacity: "0", transform: "scale(0.8)" },
      ],
      options: {
        duration: 200,
        fill: "forwards" as FillMode,
      },
    },
  };

  const teamColor =
    card.teamName === "red"
      ? "#dc2626"
      : card.teamName === "blue"
        ? "#2563eb"
        : card.teamName === "assassin"
          ? "#000"
          : "#9ca3af";

  return (
    <div
      ref={(el) => {
        console.log(`[${card.word} Container Ref] Callback fired, element:`, el);
        createAnimationRef("container", cardAnimations)(el);
      }}
      className={styles.card}
      style={{
        perspective: "1000px",
        width: "200px",
        height: "133px",
        pointerEvents: isAnimating ? "none" : "auto",
        cursor: card.selected ? "default" : "pointer",
      }}
      onClick={card.selected ? undefined : onSelect}
    >
      <div
        className={styles.cardInner}
        style={{
          transform: card.selected ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div className={`${styles.cardFace} ${styles.cardFront}`}>
          <span>{card.word}</span>
        </div>

        <div className={`${styles.cardFace} ${styles.cardBack} ${styles[card.teamName]}`}>
          <div
            style={{
              width: "60%",
              height: "60%",
              borderRadius: "8px",
              background: teamColor,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          />
        </div>
      </div>

      {/* Spymaster overlay - separate animated element */}
      <Activity mode={shouldShowOverlay ? "visible" : "hidden"}>
        <div
          ref={(el) => {
            console.log(`[${card.word} Overlay Ref] Callback fired, element:`, el);
            createAnimationRef("overlay", overlayAnimations)(el);
          }}
          style={{
            position: "absolute",
            inset: "4px",
            borderRadius: "4px",
            backgroundColor: teamColor,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      </Activity>
    </div>
  );
};

const SandboxContent: React.FC = () => {
  const { events, addEvent, clearEvents } = useGameplayEvents();
  const { viewMode, toggleSpymasterViewMode } = useViewMode();

  const mockCards = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        word: `CARD-${i + 1}`,
        teamName: (["red", "blue", "neutral", "assassin"] as const)[i % 4],
        selected: false,
      })),
    [],
  );

  const [cards, setCards] = useState(mockCards);

  const handleDeal = () => {
    clearEvents();

    // Force unmount by clearing cards
    setCards([]);

    // Remount with deal event (mimics server request delay)
    setTimeout(() => {
      setCards(mockCards.map((c) => ({ ...c, selected: false })));
      addEvent("deal");
    }, 50);
  };

  const handleReveal = () => {
    toggleSpymasterViewMode();
    if (viewMode === "normal") {
      addEvent("reveal_colors");
    } else {
      addEvent("hide_colors");
    }
  };

  const handleCardClick = (cardWord: string) => {
    setCards((prev) => prev.map((c) => (c.word === cardWord ? { ...c, selected: true } : c)));
    addEvent("select", cardWord);
  };

  return (
    <div className={styles.sandbox}>
      <header className={styles.header}>
        <h1>Event-Driven Card Animations</h1>
      </header>

      <div className={styles.scene}>
        <div className={styles.controls}>
          <button onClick={handleDeal}>🎴 Deal Cards</button>

          <button
            onClick={handleReveal}
            className={viewMode === "spymaster" ? styles.spymasterActive : ""}
          >
            {viewMode === "spymaster" ? "🔍 Hide Colors" : "🔍 Reveal Colors"}
          </button>

          <div className={styles.modeIndicator}>Mode: {viewMode}</div>
        </div>

        <div className={styles.grid}>
          {cards.map((card, index) => (
            <SandboxCard
              key={card.word}
              card={card}
              index={index}
              events={events}
              onSelect={() => handleCardClick(card.word)}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#2a2a2a",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#999",
          }}
        >
          <strong style={{ color: "#fff" }}>Event Log:</strong>
          <div style={{ marginTop: "0.5rem", maxHeight: "150px", overflow: "auto" }}>
            {events.length === 0 ? (
              <div>No events yet</div>
            ) : (
              events.map((e) => (
                <div key={e.id} style={{ padding: "0.25rem 0" }}>
                  {e.type} {e.cardId && `(${e.cardId})`}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardVisibilitySandbox: React.FC = () => {
  return (
    <AnimationEngineProvider engineId="sandbox">
      <ViewModeProvider>
        <SandboxContent />
        <DevToolsPanel defaultOpen={true} theme="dark" />
      </ViewModeProvider>
    </AnimationEngineProvider>
  );
};

export default CardVisibilitySandbox;
