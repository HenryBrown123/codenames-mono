import { useRef, useMemo } from "react";
import { useGameEvents } from "./use-game-events";
import type { GameEvent } from "./events.types";
import { useGameData } from "../../providers/game-data-provider";

/**
 * Hook to get the next unprocessed event for a specific card.
 *
 * Filters events to find:
 * 1. Global events (no cardId) that affect all cards (deal, reveal_colors, hide_colors)
 * 2. Card-specific events (with cardId) that target this card (select)
 *
 * Tracks the last processed event ID to avoid reprocessing events.
 *
 * @param cardWord - The word on the card (used as unique identifier)
 * @returns The next event type as a string, or null if no new events
 */
export const useCardEvent = (cardWord: string): string | null => {
  const { gameId } = useGameData();
  const { data: events } = useGameEvents(gameId);
  const lastProcessedIdRef = useRef<string | null>(null);

  const nextEvent = useMemo((): string | null => {
    if (!events || events.length === 0) {
      return null;
    }

    // Find the first unprocessed event that affects this card
    const unprocessedEvent = events.find((event) => {
      // Skip if already processed
      if (lastProcessedIdRef.current && event.id <= lastProcessedIdRef.current) {
        return false;
      }

      // Global events affect all cards
      if (event.type === 'deal' || event.type === 'reveal_colors' || event.type === 'hide_colors') {
        return true;
      }

      // Card-specific events: match by card word
      if (event.type === 'select' && 'cardWord' in event) {
        return event.cardWord?.toLowerCase() === cardWord.toLowerCase();
      }

      return false;
    });

    if (unprocessedEvent) {
      // Mark this event as processed
      lastProcessedIdRef.current = unprocessedEvent.id;

      // Normalize event types to match animation system expectations
      // Server uses 'select', 'deal', etc. - convert to match existing animation events
      return unprocessedEvent.type.replace('_', '-'); // reveal_colors -> reveal-colors
    }

    return null;
  }, [events, cardWord]);

  return nextEvent;
};
