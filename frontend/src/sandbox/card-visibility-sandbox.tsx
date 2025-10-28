import React, { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewModeProvider, useViewMode } from "../gameplay/game-board/view-mode";
import type { GameEvent } from "./sandbox-events.types";
import styles from "./card-visibility-sandbox.module.css";

// Mock events state (simulates React Query in real app)
function useGameplayEvents() {
  const [events, setEvents] = useState<GameEvent[]>([]);

  const addEvent = useCallback((type: string, cardId?: string) => {
    const event: GameEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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

// Simple visual state hook for sandbox
function useCardVisualState(nextEvent: string | null, isSelected: boolean) {
  return useMemo(() => {
    return {
      isFlipped: isSelected,
    };
  }, [nextEvent, isSelected]);
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

  // Get next event from event log - KEEP THIS for multiplayer
  const nextEvent = useCardEvent(events, card.word);

  // Derive visual state from events (not props!)
  const visualState = useCardVisualState(nextEvent, card.selected);

  const teamColor = {
    red: "#dc2626",
    blue: "#2563eb",
    neutral: "#9ca3af",
    assassin: "#000",
  }[card.teamName];

  return (
    <motion.div
      // Entry animation (deal)
      initial={{ opacity: 0, y: -100, rotate: -15, scale: 0.5 }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
      }}
      transition={{
        delay: index * 0.05,
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={styles.card}
      style={{
        width: "200px",
        height: "133px",
        perspective: "1000px",
        cursor: card.selected ? "default" : "pointer",
      }}
      onClick={card.selected ? undefined : onSelect}
    >
      <motion.div
        // Flip animation (select) - reacts to card.selected
        animate={{ rotateY: visualState.isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={styles.cardInner}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
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
      </motion.div>

      {/* Spymaster overlay - AnimatePresence for mount/unmount */}
      <AnimatePresence>
        {viewMode === "spymaster" && !card.selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{
              position: "absolute",
              inset: "4px",
              borderRadius: "4px",
              backgroundColor: teamColor,
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
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
  const [dealKey, setDealKey] = useState(0);

  const handleDeal = () => {
    clearEvents();

    // Force unmount by clearing cards
    setCards([]);

    // Remount with deal event (mimics server request delay)
    setTimeout(() => {
      setCards(mockCards.map((c) => ({ ...c, selected: false })));
      setDealKey((prev) => prev + 1); // Force new key = remount = re-trigger entry animations
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
          <AnimatePresence mode="wait">
            {cards.map((card, index) => (
              <SandboxCard
                key={`${dealKey}-${card.word}`}
                card={card}
                index={index}
                events={events}
                onSelect={() => handleCardClick(card.word)}
              />
            ))}
          </AnimatePresence>
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
    <ViewModeProvider>
      <SandboxContent />
    </ViewModeProvider>
  );
};

export default CardVisibilitySandbox;
