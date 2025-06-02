import { GameplayStateProvider } from "../state/gameplay-state.provider";
import { GameAggregate } from "../state/gameplay-state.types";
import { PLAYER_ROLE, PlayerRole } from "@codenames/shared/types";

/**
 * Service input parameters
 */
export type GetGameStateInput = {
  gameId: string;
  userId: number;
};

export type GetGameStateResult =
  | { success: true; data: PublicGameStateResponse }
  | { success: false; error: GetGameStateFailure };

/**
 * Public API response structure
 */
export type PublicGameStateResponse = {
  publicId: string;
  status: string;
  gameType: string;
  gameFormat: string;
  createdAt: Date;
  teams: {
    id: number;
    name: string;
    score: number;
    players: {
      id: string;
      userId: number;
      name: string;
      isActive: boolean;
    }[];
  }[];
  currentRound: {
    roundNumber: number;
    status: string;
    cards: {
      word: string;
      selected: boolean;
      teamName?: string | null;
      cardType?: string;
    }[];
    turns: {
      id: number;
      teamId: number;
      teamName: string;
      status: string;
      guessesRemaining: number;
      clue?: { word: string; number: number };
      guesses: {
        id: number;
        playerId: string;
        playerName: string;
        cardId: number;
        outcome: string | null;
      }[];
    }[];
  } | null;
  playerContext: {
    playerName: string;
    teamName: string;
    role: PlayerRole;
  };
};

/**
 * Error types for the service
 */
export const GAME_STATE_ERROR = {
  GAME_NOT_FOUND: "game-not-found",
  UNAUTHORIZED: "unauthorized",
} as const;

/**
 * Response types
 */
export type GetGameStateFailure =
  | { status: typeof GAME_STATE_ERROR.GAME_NOT_FOUND; gameId: string }
  | { status: typeof GAME_STATE_ERROR.UNAUTHORIZED; userId: number };

/**
 * Dependencies required by the service
 */
export type GetGameStateDependencies = {
  getGameState: GameplayStateProvider;
};

/**
 * Creates a service for retrieving role-specific game state
 */
export const getGameStateService = (dependencies: GetGameStateDependencies) => {
  return async (input: GetGameStateInput): Promise<GetGameStateResult> => {
    console.log(input);
    const gameData = await dependencies.getGameState(
      input.gameId,
      input.userId,
    );

    if (!gameData) {
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    if (!gameData.playerContext) {
      return {
        success: false,
        error: {
          status: GAME_STATE_ERROR.UNAUTHORIZED,
          userId: input.userId,
        },
      };
    }

    // Build the simplified response
    return {
      success: true,
      data: transformGameState(gameData),
    };
  };
};

/**
 * Transforms the internal game state to the public API format
 */
function transformGameState(gameData: GameAggregate): PublicGameStateResponse {
  const playerRole = gameData.playerContext.role;

  return {
    publicId: gameData.public_id,
    status: gameData.status,
    gameType: "SINGLE_DEVICE", // This looks hardcoded, might want to get from gameData
    gameFormat: gameData.game_format,
    createdAt: gameData.createdAt,

    teams: gameData.teams.map((team) => ({
      id: team._id,
      name: team.teamName,
      score: 0, // Placeholder for score calculation
      players: team.players.map((player) => ({
        id: player.publicId,
        userId: player._userId,
        name: player.publicName,
        isActive: player.statusId === 1,
      })),
    })),

    // Transform current round with role-based visibility
    currentRound: gameData.currentRound
      ? {
          roundNumber: gameData.currentRound.number,
          status: gameData.currentRound.status,
          cards: gameData.currentRound.cards.map((card) =>
            applyCardVisibility(card, playerRole),
          ),
          turns: gameData.currentRound.turns.map((turn) => ({
            id: turn._id,
            teamId: turn._teamId,
            teamName: turn.teamName,
            status: turn.status,
            guessesRemaining: turn.guessesRemaining,
            clue: turn.clue
              ? {
                  word: turn.clue.word,
                  number: turn.clue.number,
                }
              : undefined,
            guesses: turn.guesses.map((guess) => ({
              id: guess._id,
              playerId: guess._playerId.toString(), // Convert to string for consistency
              playerName: guess.playerName,
              cardId: guess._cardId,
              outcome: guess.outcome,
            })),
          })),
        }
      : null,

    // Use the player context directly from game state
    playerContext: {
      playerName: gameData.playerContext.playerName,
      teamName: gameData.playerContext.teamName,
      role: playerRole,
    },
  };
}

/**
 * Applies visibility rules to a card based on player role
 */
function applyCardVisibility(card: any, playerRole: PlayerRole) {
  const baseCard = {
    word: card.word,
    selected: card.selected,
  };

  // Codemasters see everything, others only see revealed cards
  if (playerRole === PLAYER_ROLE.CODEMASTER || card.selected) {
    return {
      ...baseCard,
      teamName: card.teamName,
      cardType: card.cardType,
    };
  }

  return baseCard;
}
