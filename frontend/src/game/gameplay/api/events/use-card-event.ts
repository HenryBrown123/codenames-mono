import { useRef, useMemo } from "react";
import { useGameEvents } from "./use-game-events";
import type { GameEvent } from "./events.types";
import { useGameData } from "../../providers/game-data-provider";

/**
 * Returns the next event affecting a specific card on the board.
 *
 * Combines global events (deal, reveal_colors, hide_colors — apply to
 * every card) with card-specific `select` events matched by word.
 * Tracks the last processed event id in a ref so each event is only
 * surfaced once, then normalises underscores in the type string to
 * dashes so the value drops straight into the card's animation
 * variant key.
 *
 * Returns `null` when there is nothing new to react to.
 */
export const useCardEvent = (cardWord: string): string | null => {
  const { gameId } = useGameData();
  const { data: events } = useGameEvents(gameId);
  const lastProcessedIdRef = useRef<string | null>(null);

  const nextEvent = useMemo((): string | null => {
    if (!events || events.length === 0) {
      return null;
    }

    const unprocessedEvent = events.find((event) => {
      if (lastProcessedIdRef.current && event.id <= lastProcessedIdRef.current) {
        return false;
      }

      // Global events affect every card.
      if (event.type === 'deal' || event.type === 'reveal_colors' || event.type === 'hide_colors') {
        return true;
      }

      if (event.type === 'select' && 'cardWord' in event) {
        return event.cardWord?.toLowerCase() === cardWord.toLowerCase();
      }

      return false;
    });

    if (unprocessedEvent) {
      lastProcessedIdRef.current = unprocessedEvent.id;
      // Normalise underscores to dashes so the value matches the
      // animation variant keys (e.g. reveal_colors → reveal-colors).
      return unprocessedEvent.type.replace('_', '-');
    }

    return null;
  }, [events, cardWord]);

  return nextEvent;
};
