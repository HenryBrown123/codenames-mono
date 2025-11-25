/**
 * WebSocket event types for real-time game updates
 * These match the backend WebSocketEvent enum
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

  // AI events
  AI_PIPELINE_STARTED = "ai_pipeline_started",
  AI_PIPELINE_STAGE = "ai_pipeline_stage",
  AI_PIPELINE_COMPLETE = "ai_pipeline_complete",
  AI_PIPELINE_FAILED = "ai_pipeline_failed",

  // Chat events
  GAME_MESSAGE_CREATED = "game_message_created",
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
 * Event payload for AI pipeline events
 */
export interface AIPipelineEventPayload extends BaseEventPayload {
  runId: string;
  pipelineType?: string;
  stage?: string;
  error?: string;
}

/**
 * Event payload for game message events
 */
export interface GameMessageEventPayload extends BaseEventPayload {
  messageId: string;
  messageType: string;
  teamId?: number;
}

/**
 * Union type for all event payloads
 */
export type EventPayload =
  | BaseEventPayload
  | PlayerEventPayload
  | GameplayEventPayload
  | GameStateEventPayload
  | AIPipelineEventPayload
  | GameMessageEventPayload;
