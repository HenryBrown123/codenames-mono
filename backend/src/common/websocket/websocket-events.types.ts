/**
 * WebSocket event types for real-time game updates
 */
export enum WebSocketEvent {
  // Connection events
  CONNECTION = "connection",
  DISCONNECT = "disconnect",

  // Room events
  JOIN_GAME = "join_game",
  LEAVE_GAME = "leave_game",

  // Lobby events
  PLAYER_JOINED = "player_joined",
  PLAYER_LEFT = "player_left",
  PLAYER_UPDATED = "player_updated",
  GAME_STARTED = "game_started",

  // Round events
  ROUND_CREATED = "round_created",
  ROUND_STARTED = "round_started",
  CARDS_DEALT = "cards_dealt",
  ROUND_ENDED = "round_ended",

  // Turn events
  CLUE_GIVEN = "clue_given",
  GUESS_MADE = "guess_made",
  TURN_ENDED = "turn_ended",

  // Game events
  GAME_ENDED = "game_ended",
  GAME_UPDATED = "game_updated",
}

/**
 * Base payload structure for all events
 */
export interface BaseEventPayload {
  gameId: string;
  timestamp: string;
}

/**
 * Event payload for player-related events
 */
export interface PlayerEventPayload extends BaseEventPayload {
  playerId?: string;
  playerName?: string;
  teamId?: number;
}

/**
 * Event payload for gameplay events
 */
export interface GameplayEventPayload extends BaseEventPayload {
  roundNumber?: number;
  turnId?: string;
  playerId?: string;
}

/**
 * Event payload for game state changes
 */
export interface GameStateEventPayload extends BaseEventPayload {
  gameStatus?: string;
  winningTeamId?: number;
}

/**
 * Union type for all event payloads
 */
export type EventPayload =
  | BaseEventPayload
  | PlayerEventPayload
  | GameplayEventPayload
  | GameStateEventPayload;
