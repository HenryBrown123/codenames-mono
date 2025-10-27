/**
 * Event type definitions matching the server API response
 */

// Base event structure shared by all events
export interface BaseEvent {
  id: string;              // Unique event ID (e.g., evt_001)
  gameId: string;          // Game this event belongs to
  timestamp: string;       // ISO 8601 timestamp
  type: string;            // Event type discriminator
}

// Global events (affect all cards)
export interface DealEvent extends BaseEvent {
  type: 'deal';
  cardIds: number[];       // All card IDs that were dealt
  roundId?: string;
  startingTeam?: number;
  otherTeam?: number;
}

export interface RevealColorsEvent extends BaseEvent {
  type: 'reveal_colors';
  playerId?: string;       // Who triggered spymaster view
}

export interface HideColorsEvent extends BaseEvent {
  type: 'hide_colors';
  playerId?: string;       // Who toggled back to normal view
}

// Card-specific events (cardId property indicates target)
export interface SelectEvent extends BaseEvent {
  type: 'select';
  cardId?: string;         // Which card was selected
  playerId?: string;       // Who selected it
  teamName?: string;       // Which team made the selection
  cardWord?: string;       // Word on the card
  outcome?: string;        // Outcome of the selection
}

// Union type of all possible events
export type GameEvent = DealEvent | RevealColorsEvent | HideColorsEvent | SelectEvent;

// Type guard helpers
export function isDealEvent(event: GameEvent): event is DealEvent {
  return event.type === 'deal';
}

export function isSelectEvent(event: GameEvent): event is SelectEvent {
  return event.type === 'select';
}

export function isRevealColorsEvent(event: GameEvent): event is RevealColorsEvent {
  return event.type === 'reveal_colors';
}

export function isHideColorsEvent(event: GameEvent): event is HideColorsEvent {
  return event.type === 'hide_colors';
}
