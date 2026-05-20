/** Common envelope on every game event coming back from the server. */
export interface BaseEvent {
  id: string;              // Unique event ID (e.g., evt_001)
  gameId: string;          // Game this event belongs to
  timestamp: string;       // ISO 8601 timestamp
  type: string;            // Event type discriminator
}

/** A round being dealt — names every card id placed on the board. */
export interface DealEvent extends BaseEvent {
  type: 'deal';
  cardIds: number[];       // All card IDs that were dealt
  roundId?: string;
  startingTeam?: number;
  otherTeam?: number;
}

/** Spymaster view was switched on — all card colours revealed. */
export interface RevealColorsEvent extends BaseEvent {
  type: 'reveal_colors';
  playerId?: string;       // Who triggered spymaster view
}

/** Spymaster view was switched off — colours hidden again. */
export interface HideColorsEvent extends BaseEvent {
  type: 'hide_colors';
  playerId?: string;       // Who toggled back to normal view
}

/** A single card was selected during play. */
export interface SelectEvent extends BaseEvent {
  type: 'select';
  cardId?: string;         // Which card was selected
  playerId?: string;       // Who selected it
  teamName?: string;       // Which team made the selection
  cardWord?: string;       // Word on the card
  outcome?: string;        // Outcome of the selection
}

/** Discriminated union of every game event the frontend handles. */
export type GameEvent = DealEvent | RevealColorsEvent | HideColorsEvent | SelectEvent;

/** Narrows {@link GameEvent} to a {@link DealEvent}. */
export function isDealEvent(event: GameEvent): event is DealEvent {
  return event.type === 'deal';
}

/** Narrows {@link GameEvent} to a {@link SelectEvent}. */
export function isSelectEvent(event: GameEvent): event is SelectEvent {
  return event.type === 'select';
}

/** Narrows {@link GameEvent} to a {@link RevealColorsEvent}. */
export function isRevealColorsEvent(event: GameEvent): event is RevealColorsEvent {
  return event.type === 'reveal_colors';
}

/** Narrows {@link GameEvent} to a {@link HideColorsEvent}. */
export function isHideColorsEvent(event: GameEvent): event is HideColorsEvent {
  return event.type === 'hide_colors';
}
