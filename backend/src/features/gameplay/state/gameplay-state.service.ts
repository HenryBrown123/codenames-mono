import { GameplayStateProvider } from "../state/gameplay-state.provider";
import { complexProperties } from "../state/gameplay-state.helpers";
import { GameAggregate, Player } from "../state/gameplay-state.types";
import { ROUND_STATE, PlayerRole } from "@codenames/shared/types";
import { CardResult } from "@backend/common/data-access/cards.repository";

/**
 * Basic input required to get a game state
 */
export type GetGameStateInput = {
  gameId: string;
  userId: number;
  playerId?: number; // Optional player ID for single-device mode
};

/**
 * Error types for game state retrieval
 */
export const GAME_STATE_ERROR = {
  GAME_NOT_FOUND: "game-not-found",
  UNAUTHORIZED: "unauthorized",
} as const;

/**
 * Represents failure scenarios when retrieving game state
 */
export type GetGameStateFailure =
  | { status: typeof GAME_STATE_ERROR.GAME_NOT_FOUND; gameId: string }
  | {
      status: typeof GAME_STATE_ERROR.UNAUTHORIZED;
      userId: number;
      playerId?: number;
    };

/**
 * The complete result of retrieving a game state
 */
export type GetGameStateResult =
  | { success: true; data: GameStateResponse }
  | { success: false; error: GetGameStateFailure };

/**
 * Client-friendly game state response
 */
export type GameStateResponse = {
  id: number;
  publicId: string;
  status: string;
  gameType: string;
  gameFormat: string;
  createdAt: Date;
  teams: TeamResponse[];
  currentRound: CurrentRoundResponse | null;
  historicalRounds: HistoricalRoundResponse[];
  playerContext: {
    playerId?: number;
    teamId?: number;
    role: PlayerRole;
  };
};

/**
 * Team data for response
 */
export type TeamResponse = {
  id: number;
  name: string;
  score: number;
  players: PlayerResponse[];
};

/**
 * Player data for response
 */
export type PlayerResponse = {
  id: number;
  userId: number;
  name: string;
  isActive: boolean;
};

/**
 * Round role assignment
 */
export type RoleAssignment = {
  playerId: number;
  teamId: number;
  role: PlayerRole;
};

/**
 * Current round data for response
 */
export type CurrentRoundResponse = {
  id: number;
  roundNumber: number;
  status: string;
  startingTeamId: number;
  cards: CardResponse[];
  currentTeamId: number;
  currentTurn?: TurnResponse;
  roleAssignments: RoleAssignment[];
};

/**
 * Card data for response
 */
export type CardResponse = {
  id: number;
  word: string;
  selected: boolean;
  teamId?: number | null;
  cardType?: string;
};

/**
 * Turn data for response
 */
export type TurnResponse = {
  id: number;
  teamId: number;
  clue?: {
    word: string;
    number: number;
  };
  guessesRemaining?: number;
};

/**
 * Historical round data for response
 */
export type HistoricalRoundResponse = {
  id: number;
  roundNumber: number;
  status: string;
  winningTeamId?: number;
  startingTeamId: number;
  cards: CardResponse[];
  roleAssignments: RoleAssignment[];
};

/**
 * Dependencies required by the game state service
 */
export type GetGameStateDependencies = {
  getGameState: GameplayStateProvider;
  getRoundRoleAssignments: (roundId: number) => Promise<RoleAssignment[]>;
};

/**
 * Creates a service for retrieving complete game state
 */
export const getGameStateService = (dependencies: GetGameStateDependencies) => {
  /**
   * Retrieves the complete state of a game
   *
   * @param input - Game ID, user ID, and optional player ID
   * @returns Full game state or error
   */
  return async (input: GetGameStateInput): Promise<GetGameStateResult> => {
    // Retrieve raw game state from provider
    const gameData = await dependencies.getGameState(input.gameId);

    if (!gameData) {
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    // Determine player info and authorization
    const playerContext = { role: "CODEMASTER" };

    // if role.none :

    if (!playerContext.role) {
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.UNAUTHORIZED,
          userId: input.userId,
          playerId: input.playerId,
        },
      };
    }

    // run sanitization function that strips out data that isn't accessible via role....
    // best to only allow specific attributes rather than Omitting...
    const sanitizedGameplayState = gameData;

    return {
      success: true,
      data: {
        publicId: sanitizedGameplayState.public_id,
        status: sanitizedGameplayState.status,
        gameType: "SINGLE_DEVICE",
        gameFormat: sanitizedGameplayState.game_format,
        teams:  sanitizedGameplayState.teams.map((team) => {team.id,team.teamName,team.players}),
        currentRound: CurrentRoundResponse | null;
        historicalRounds: HistoricalRoundResponse[];
        playerContext: {
          playerId?: number;
          teamId?: number;
          role: PlayerRole;
        };
      };
    };
  };
};
